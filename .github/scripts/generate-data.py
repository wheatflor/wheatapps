#!/usr/bin/env python3
"""
동적 폴더 구조 기반 data.json 자동 생성
모든 apps/*/ 구조를 자동으로 감지하고 data.json 생성

폴더 구조:
  apps/
  ├── Job/
  │   ├── JobHuntingInfo/
  │   │   ├── index.html
  │   │   ├── style.css
  │   │   ├── script.js
  │   │   └── meta.json (선택사항)
  │   └── AnotherApp/
  ├── Tools/
  │   ├── company-search/
  │   └── ...
  └── Converters/
      └── ...
"""

import os
import json
import sys
from datetime import datetime

def get_app_meta(app_dir):
    """앱 폴더에서 meta.json 또는 자동 생성 메타데이터 추출"""
    meta_path = os.path.join(app_dir, 'meta.json')

    # meta.json이 있으면 사용
    if os.path.exists(meta_path):
        try:
            with open(meta_path, 'r', encoding='utf-8') as f:
                meta = json.load(f)
                # 필수 필드 검증
                if 'name' not in meta:
                    meta['name'] = os.path.basename(app_dir)
                if 'description' not in meta:
                    meta['description'] = f'{meta["name"]} 웹앱'
                if 'icon' not in meta:
                    meta['icon'] = '📦'
                return meta
        except Exception as e:
            print(f"⚠️  {meta_path} 파싱 실패: {e}")

    # 없으면 자동 생성
    app_name = os.path.basename(app_dir)
    return {
        'name': app_name,
        'description': f'{app_name} 웹앱',
        'icon': '📦',
        'tags': [],
        'features': []
    }

def generate_data_json():
    """동적 폴더 구조 기반으로 data.json 생성"""
    apps_dir = 'apps'

    if not os.path.exists(apps_dir):
        print(f"❌ {apps_dir} 폴더가 없습니다.")
        return False

    data = {
        'lastUpdated': datetime.now().isoformat(),
        'version': '1.0.0',
        'categories': [],
        'apps': [],
        'tree': {}  # 폴더 트리 구조 저장
    }

    categories = set()
    tree = {}

    # apps 폴더 구조 스캔 (모든 깊이)
    for category in sorted(os.listdir(apps_dir)):
        category_path = os.path.join(apps_dir, category)

        # 폴더인지 확인
        if not os.path.isdir(category_path):
            continue

        # 카테고리 추가
        categories.add(category)
        tree[category] = []

        # 카테고리 내 앱들 스캔
        for app_folder in sorted(os.listdir(category_path)):
            app_path = os.path.join(category_path, app_folder)

            if not os.path.isdir(app_path):
                continue

            # index.html이 있는지 확인 (유효한 앱인지 검증)
            if not os.path.exists(os.path.join(app_path, 'index.html')):
                print(f"⚠️  {app_path}에 index.html이 없습니다. 건너뜁니다.")
                continue

            # meta.json 또는 자동 생성
            meta = get_app_meta(app_path)

            # 필수 필드 추가
            meta['id'] = app_folder
            meta['category'] = category
            meta['url'] = f'{category}/{app_folder}/'

            # 기본값 설정
            if 'tags' not in meta:
                meta['tags'] = []
            if 'features' not in meta:
                meta['features'] = []

            data['apps'].append(meta)
            tree[category].append({
                'id': app_folder,
                'name': meta.get('name', app_folder),
                'icon': meta.get('icon', '📦')
            })

            print(f"✅ {category}/{app_folder} - {meta.get('name', app_folder)}")

    # 카테고리 정렬
    data['categories'] = sorted(list(categories))
    data['tree'] = tree

    if len(data['apps']) == 0:
        print("❌ 앱을 찾을 수 없습니다. apps/ 폴더 구조를 확인하세요.")
        return False

    # data.json 저장
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ data.json 생성 완료")
    print(f"   - 카테고리: {len(data['categories'])} ({', '.join(data['categories'])})")
    print(f"   - 앱: {len(data['apps'])}")

    return True

if __name__ == '__main__':
    success = generate_data_json()
    sys.exit(0 if success else 1)
