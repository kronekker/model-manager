import sys
import os
import re
import json
from datetime import datetime
from huggingface_hub import scan_cache_dir, HfApi, list_repo_tree

def get_params_info(repo_id, total_params):
    total_billions = None
    active_billions = None
    
    if total_params:
        total_billions = total_params / 1e9
        
        # Check for MoE pattern in repo_id or model name
        match = re.search(r"-(\d+(?:\.\d+)?)[Bb]-A(\d+(?:\.\d+)?)[Bb]-", repo_id)
        if match:
            name_total = float(match.group(1))
            name_active = float(match.group(2))
            if name_total > 0:
                active_billions = total_billions * (name_active / name_total)
        else:
            active_billions = total_billions
            
    return total_billions, active_billions

def get_cache():
    try:
        cache_info = scan_cache_dir()
        repos = []
        for repo in cache_info.repos:
            for revision in repo.revisions:
                all_files = revision.files
                ggufs = [f for f in all_files if f.file_name.endswith(".gguf")]
                mmprojs = [f for f in ggufs if "mmproj" in f.file_name.lower()]
                
                # More robust split detection: if it matches -0000X-of-YYYYY.gguf and X > 1, ignore it.
                def is_secondary_split(name):
                    match = re.search(r"-(\d{5})-of-(\d{5})\.gguf$", name)
                    if match:
                        part_num = int(match.group(1))
                        if part_num > 1:
                            return True
                    return False

                quants = [f for f in ggufs if f not in mmprojs and not is_secondary_split(f.file_name)]
                mmproj_path = str(mmprojs[0].file_path) if mmprojs else None
                
                for file in quants:
                    size_bytes = os.path.getsize(file.file_path)
                    last_mod = "N/A"
                    if revision.last_modified:
                        last_mod = datetime.fromtimestamp(revision.last_modified).strftime("%Y-%m-%d %H:%M:%S")
                    
                    display_name = file.file_name
                    if "-00001-of-" in file.file_name:
                        display_name = re.sub(r"-00001-of-\d{5}\.gguf$", " (Split Model)", file.file_name)

                    repos.append({
                        "repo_id": repo.repo_id,
                        "file_name": display_name,
                        "real_name": file.file_name,
                        "size": f"{size_bytes / (1024**3):.2f} GB",
                        "path": str(file.file_path),
                        "mmproj_path": mmproj_path,
                        "last_modified": last_mod
                    })
        repos.sort(key=lambda x: x["repo_id"])
        return {"success": True, "data": repos}
    except Exception as e:
        return {"success": False, "error": str(e)}

def search_models(q):
    try:
        api = HfApi()
        expand_fields = ["gguf", "trendingScore"]
        models = api.list_models(filter="gguf", search=q, sort="downloads", limit=150, expand=expand_fields)
        
        # Get cached repos for indicator
        cache_info = scan_cache_dir()
        cached_repos = {repo.repo_id for repo in cache_info.repos}
        
        results = []
        for m in models:
            m_dict = m.__dict__.copy()
            if 'lastModified' in m_dict and m_dict['lastModified']:
                m_dict['lastModified'] = str(m_dict['lastModified'])
            if 'createdAt' in m_dict and m_dict['createdAt']:
                m_dict['createdAt'] = str(m_dict['createdAt'])
            
            gguf_info = getattr(m, 'gguf', {})
            total_params = gguf_info.get('total') if isinstance(gguf_info, dict) else None

            total_billions, active_billions = get_params_info(m.id, total_params)

            results.append({
                "id": m.id,
                "downloads": getattr(m, 'downloads', 0),
                "trending_score": getattr(m, 'trending_score', 0),
                "params": round(total_billions, 1) if total_billions is not None else None,
                "active_params": round(active_billions, 1) if active_billions is not None else None,
                "context": (getattr(m, 'gguf', {}) or {}).get('context_length') or "N/A",
                "is_cached": m.id in cached_repos,
                "raw": m_dict
            })
        return {"success": True, "data": results}
    except Exception as e:
        return {"success": False, "error": str(e)}

def inspect_model(repo_id):
    core_repo_id = repo_id
    files = []
    mmproj = []
    other = []
    error = ''

    if "/" in core_repo_id:
        core_repo_id = core_repo_id.split("/")[1]
    else:
        core_repo_id = repo_id               

    if (core_repo_id.lower().endswith("-gguf")):
        core_repo_id = core_repo_id[:-5]

    try:
        tree = list_repo_tree(repo_id, recursive=True)
   
        # Get cached files for this repo    
        cache_info = scan_cache_dir()
        cached_files = set()
        for repo in cache_info.repos:
            if repo.repo_id == repo_id:
                for revision in repo.revisions:
                    for file in revision.files:
                        cached_files.add(file.file_name)
        
        for file_info in tree:
            file_meta = {
                "path": file_info.path,
                "quant": "",
                "size_gb": None,
                "size" : None,
                "is_gguf": False,
                "total_params": None,
                "active_params": None,
                "is_mmproj": False,
                "is_split": "of-" in file_info.path,
                "is_cached": False,
                "logs": []
            }

            if "/" in file_meta["path"]:
                file_meta["logs"].append('Removed directory from path: ' + file_info.path.split("/")[0])
                file_meta["path"] = file_meta["path"].split("/")[1]

            if not getattr(file_info, 'size', None):
                file_meta["logs"].append('No size attribute.')
                other.append(file_meta)                
                continue

            file_meta["size"] = file_info.size
            file_meta["size_gb"] = file_meta["size"] / (1024**3)
            
            if file_info.path in cached_files:
                file_meta["is_cached"] = True
            else:
                file_meta["is_cached"] = False
                for path in cached_files:
                    file_meta["logs"].append('Found in cache: ' + path)
                file_meta["logs"].append('Not found in cache.')   

            if file_meta["path"].lower().endswith(".gguf"):
                file_meta["is_gguf"] = True
                file_meta["path"] = file_meta["path"][:-5]
            else:
                file_meta["logs"].append('No .gguf suffix.')    
                other.append(file_meta)
                continue
            
            match = re.search(r"-(\d+)-of-(\d+)", file_meta["path"]) 
            if match:
                if int(match.group(1)) > 1:
                    continue

                new_name = file_meta["path"][:match.start()]
                file_meta["logs"].append("Removed split part of file name: " + file_meta["path"] + " => " + new_name)
                file_meta["path"] = new_name
            
            if "mmproj" in file_meta["path"].lower():
                file_meta["is_mmproj"] = True
                mmproj.append(file_meta)
                continue 

            if core_repo_id in file_meta["path"]:
                file_meta["quant"] = file_meta["path"][len(core_repo_id)+1:]
            else:
                file_meta["logs"].append(core_repo_id + ' not found in ' + file_meta["path"])
                other.append(file_meta)
                continue

            total, active = get_params_info(repo_id, file_info.size)
            file_meta["total_params"] = round(total, 1) if total is not None else None
            file_meta["active_params"] = round(active, 1) if active is not None else None
            file_meta["size_gb"] = round(file_meta["size_gb"], 2) if file_meta["size_gb"] is not None else None
            file_meta["logs"].append('Parameters: ' + str(file_meta["total_params"]) + ' Active: ' + str(file_meta["active_params"]))
            files.append(file_meta)

        return {
            "success": True,
            "data": {
                "repo_id": repo_id,
                "quants": files,
                "mmproj": mmproj,
                "other": other,
                "error": error,
                "cached_files": list(cached_files)
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No action provided"}))
        sys.exit(1)
    
    action = sys.argv[1]
    if action == 'cache':
        print(json.dumps(get_cache()))
    elif action == 'search':
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "No query provided"}))
            sys.exit(1)
        print(json.dumps(search_models(sys.argv[2])))
    elif action == 'inspect':
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "No repo_id provided"}))
            sys.exit(1)
        print(json.dumps(inspect_model(sys.argv[2])))
    else:
        print(json.dumps({"success": False, "error": f"Unknown action: {action}"}))
        sys.exit(1)
