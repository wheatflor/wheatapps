#!/usr/bin/env python3
"""
apps 폴더 구조를 기반으로 data.json 자동 생성
폴더 구조:
  apps/
  ├── category1/
  │   ├── app1/
  │   │   └── meta.json (선택사항)
  │   └── app2/
  └── category2/
      └── app3/
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
        with open(meta_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    # 없으면 폴더 이름 기반으로 자동 생성
    app_name = os.path.basename(app_dir)
    return {
        'id': app_name,
        'name': app_name,
        'description': f'{app_name} 웹앱',
        'icon': '📦',
        'tags': [],
        'features': []
    }

def generate_data_json():
    """폴더 구조 기반으로 data.json 생성"""
    apps_dir = 'apps'

    if not os.path.exists(apps_dir):
        print(f"❌ {apps_dir} 폴더가 없습니다.")
        return False

    data = {
        'lastUpdated': datetime.now().isoformat(),
        'version': '1.0.0',
        'categories': [],
        'apps': []
    }

    categories = set()

    # apps 폴더 구조 스캔
    for category in sorted(os.listdir(apps_dir)):
        category_path = os.path.join(apps_dir, category)

        # 폴더인지 확인
        if not os.path.isdir(category_path):
            continue

        # 카테고리 추가
        categories.add(category)

        # 카테고리 내 앱들 스캔
        for app_folder in sorted(os.listdir(category_path)):
            app_path = os.path.join(category_path, app_folder)

            if not os.path.isdir(app_path):
                continue

            # meta.json 또는 자동 생성
            meta = get_app_meta(app_path)

            # 필수 필드 추가
            meta['category'] = category
            meta['url'] = f'{category}/{app_folder}/'

            # 기본값 설정
            if 'name' not in meta:
                meta['name'] = app_folder
            if 'description' not in meta:
                meta['description'] = f'{app_folder} 웹앱'
            if 'icon' not in meta:
                meta['icon'] = '📦'
            if 'tags' not in meta:
                meta['tags'] = []
            if 'features' not in meta:
                meta['features'] = []

            data['apps'].append(meta)

    # 카테고리 정렬
    data['categories'] = sorted(list(categories))

    # data.json 저장
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✅ data.json 생성 완료")
    print(f"   - 카테고리: {len(data['categories'])}")
    print(f"   - 앱: {len(data['apps'])}")

    return True

if __name__ == '__main__':
    success = generate_data_json()
    sys.exit(0 if success else 1)
