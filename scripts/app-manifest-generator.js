/**
 * 폴더 구조 자동 스캔 및 data.json 생성
 * 실행: npm run generate-manifest 또는 node scripts/app-manifest-generator.js
 */

const fs = require('fs');
const path = require('path');

const APPS_DIR = path.join(__dirname, '../apps');
const OUTPUT_FILE = path.join(__dirname, '../data.json');

console.log('🔍 앱 폴더 스캔 시작...\n');

function scanApps() {
    const categories = {};
    const apps = [];

    // 카테고리 폴더 순회
    if (!fs.existsSync(APPS_DIR)) {
        console.error('❌ apps 폴더가 없습니다.');
        return { categories: [], apps: [] };
    }

    const categoryFolders = fs.readdirSync(APPS_DIR)
        .filter(f => fs.statSync(path.join(APPS_DIR, f)).isDirectory());

    categoryFolders.forEach(categoryName => {
        const categoryPath = path.join(APPS_DIR, categoryName);
        
        // _meta.json 파일 확인
        const categoryMetaPath = path.join(categoryPath, '_meta.json');
        let categoryMeta = {
            name: categoryName,
            description: `${categoryName} 앱 모음`
        };

        if (fs.existsSync(categoryMetaPath)) {
            categoryMeta = {
                ...categoryMeta,
                ...JSON.parse(fs.readFileSync(categoryMetaPath, 'utf-8'))
            };
        }

        categories[categoryName] = categoryMeta;

        // 앱 폴더 순회
        const appFolders = fs.readdirSync(categoryPath)
            .filter(f => {
                const fullPath = path.join(categoryPath, f);
                return fs.statSync(fullPath).isDirectory() && f !== '_meta';
            });

        appFolders.forEach(appName => {
            const appPath = path.join(categoryPath, appName);
            const metaPath = path.join(appPath, 'meta.json');
            
            // meta.json에서 앱 정보 읽기
            let appMeta = {
                id: appName,
                name: appName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                category: categoryName,
                description: 'No description',
                icon: '📱',
                tags: [],
                created: new Date().toISOString().split('T')[0],
                updated: new Date().toISOString().split('T')[0]
            };

            if (fs.existsSync(metaPath)) {
                const customMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
                appMeta = { ...appMeta, ...customMeta };
            }

            apps.push(appMeta);
            console.log(`✅ ${categoryName}/${appName} (${appMeta.name})`);
        });

        console.log(`   └─ ${appFolders.length}개 앱 발견\n`);
    });

    return {
        categories: Object.values(categories),
        apps: apps
    };
}

// 메인 로직
try {
    const data = scanApps();
    
    const output = {
        categories: data.categories,
        apps: data.apps.sort((a, b) => a.category.localeCompare(b.category)),
        lastUpdated: new Date().toISOString(),
        totalApps: data.apps.length,
        totalCategories: data.categories.length
    };

    // data.json 생성
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
    
    console.log(`\n✨ 완료!`);
    console.log(`📊 총 ${data.apps.length}개 앱, ${data.categories.length}개 카테고리`);
    console.log(`📝 ${OUTPUT_FILE} 생성됨\n`);

} catch (error) {
    console.error('❌ 오류:', error.message);
    process.exit(1);
}