import fs from 'fs';
import path from 'path';

const wikiPath = path.resolve('public/data/wiki.json');
const wiki = JSON.parse(fs.readFileSync(wikiPath, 'utf-8'));

// 단순 텍스트를 unit 구조로 변환하는 함수
function convertToUnitFormat(content, category) {
    // 이미 unit 구조가 있으면 그대로 반환
    if (content.includes("<div class='unit")) {
        return content;
    }

    // 제목 라인 제거 (【...】)
    content = content.replace(/^【[^】]+】\s*\n*/g, '');

    // 섹션별로 분리 (🪄 기준으로)
    // 🪄 앞에 줄바꿈이 있거나 시작 부분
    const sections = content.split(/\n*🪄\s*/);

    let result = '';
    let unitIndex = 1;

    sections.forEach((section, index) => {
        if (!section.trim()) return;

        let sectionContent = section;
        let title = '';

        // 제목과 내용 분리
        const lines = sectionContent.split('\n');
        title = lines[0].trim();
        sectionContent = lines.slice(1).join('\n').trim();

        if (!title || !sectionContent) return;

        // 섹션 타입에 따라 변환
        let unitContent = '';

        if (title.includes('핵심 키워드') && !title.includes('역방향')) {
            // 키워드를 태그로 변환
            const keywords = sectionContent.split(/[,，、]\s*/).filter(k => k.trim());
            unitContent = keywords.map(k => `<span class='tag'>${k.trim()}</span>`).join(' ');
        } else if (title.includes('역방향 핵심 키워드')) {
            const keywords = sectionContent.split(/[,，、]\s*/).filter(k => k.trim());
            unitContent = keywords.map(k => `<span class='tag'>${k.trim()}</span>`).join(' ');
        } else if (title.includes('정방향 해석') || title.includes('역방향 해석')) {
            // dl/dt/dd 구조 변환
            unitContent = convertInterpretation(sectionContent);
        } else if (title.includes('재물') || title.includes('경매')) {
            unitContent = convertWealthSection(sectionContent);
        } else if (title.includes('실전 상담')) {
            unitContent = convertCounselingPoints(sectionContent);
        } else if (title.includes('카드 조합')) {
            unitContent = convertCombinations(sectionContent);
        } else if (title.includes('연애 상담') || title.includes('직업 상담')) {
            unitContent = `<div class='dl_wrap'>${sectionContent}</div>`;
        } else if (title.includes('수제자') || title.includes('추가 조언')) {
            unitContent = `<div class='dl_wrap'><dl><dt>조언</dt><dd>${sectionContent.replace(/^[^:：]+[:：]\s*/, '')}</dd></dl></div>`;
        } else if (title.includes('타로 마스터')) {
            unitContent = `<div class='dl_wrap'><dl><dt>조언</dt><dd>${sectionContent}</dd></dl></div>`;
        } else {
            // 기본 텍스트
            unitContent = `<div class='dl_wrap'>${sectionContent}</div>`;
        }

        result += `<div class='unit u${unitIndex}'><h3>🪄 ${title}</h3><div class='u_cont'>${unitContent}</div></div>`;
        unitIndex++;
    });

    return result;
}

// 해석 섹션 변환 - 개선된 버전
function convertInterpretation(content) {
    let result = '';

    // <dl><dt>연애:</dt><dd>...</dd></dl> 형식을 모두 찾아서 처리
    // 여러 줄에 걸쳐 있을 수 있으므로 정규식 수정
    const dlRegex = /<dl><dt>([^<]+)<\/dt><dd>([^<]*(?:<[^>]*>[^<]*)*)<\/dd><\/dl>/g;
    let match;

    while ((match = dlRegex.exec(content)) !== null) {
        result += `<div class='dl_wrap'><dl><dt>${match[1]}</dt><dd>${match[2]}</dd></dl></div>`;
    }

    // • 조언: 형식 처리
    const adviceMatch = content.match(/•\s*조언[:：]\s*(.+?)(?=\n|$)/);
    if (adviceMatch) {
        result += `<div class='dl_wrap'><dl><dt>조언</dt><dd>${adviceMatch[1]}</dd></dl></div>`;
    }

    return result || `<div class='dl_wrap'>${content}</div>`;
}

// 재물 섹션 변환
function convertWealthSection(content) {
    let result = '';
    const lines = content.split('\n').filter(l => l.trim());

    // 한 줄에 모든 내용이 있는 경우 처리
    if (lines.length <= 2 && content.includes('💰 재물 흐름') && content.includes('💰 경매 운')) {
        // 💰 재물 흐름 ... 💰 경매 운 ... 형식
        const wealthMatch = content.match(/💰\s*재물 흐름\s*([^💰]+)/);
        const auctionMatch = content.match(/💰\s*경매 운\s*(.+?)(?=$)/);

        result = `<div class='item'><h4>💰 재물 흐름</h4>`;
        if (wealthMatch) {
            result += `<div class='dl_wrap'><dl><dt>•</dt><dd>${wealthMatch[1].trim()}</dd></dl></div>`;
        }
        result += `</div><div class='item'><h4>💰 경매 운</h4>`;
        if (auctionMatch) {
            result += `<div class='dl_wrap'><dl><dt>•</dt><dd>${auctionMatch[1].trim()}</dd></dl></div>`;
        }
        result += `</div>`;
        return result;
    }

    let currentItem = '';
    lines.forEach(line => {
        if (line.includes('💰 재물 흐름')) {
            if (currentItem) result += `</div>`;
            result += `<div class='item'><h4>💰 재물 흐름</h4>`;
            currentItem = 'wealth';
            // 같은 줄에 내용이 있으면 추가
            const afterTitle = line.replace(/💰\s*재물 흐름\s*/, '').trim();
            if (afterTitle) {
                result += `<div class='dl_wrap'><dl><dt>•</dt><dd>${afterTitle}</dd></dl></div>`;
            }
        } else if (line.includes('💰 경매 운')) {
            if (currentItem) result += `</div>`;
            result += `<div class='item'><h4>💰 경매 운</h4>`;
            currentItem = 'auction';
            // 같은 줄에 내용이 있으면 추가
            const afterTitle = line.replace(/💰\s*경매 운\s*/, '').trim();
            if (afterTitle) {
                result += `<div class='dl_wrap'><dl><dt>•</dt><dd>${afterTitle}</dd></dl></div>`;
            }
        } else if (line.trim() && currentItem) {
            result += `<div class='dl_wrap'><dl><dt>•</dt><dd>${line.trim()}</dd></dl></div>`;
        }
    });
    if (currentItem) result += `</div>`;

    return result || `<div class='dl_wrap'>${content}</div>`;
}

// 상담 포인트 변환
function convertCounselingPoints(content) {
    let result = '';
    const points = content.split(/\n/).filter(l => l.trim());

    points.forEach(point => {
        const match = point.match(/(\d+)\.\s*([^:：]+)[:：]\s*(.+)/);
        if (match) {
            result += `<div class='dl_wrap'><dl><dt>${match[1]}. ${match[2]}</dt><dd>${match[3]}</dd></dl></div>`;
        } else if (point.trim()) {
            result += `<div class='dl_wrap'>${point}</div>`;
        }
    });

    return result || content;
}

// 카드 조합 변환
function convertCombinations(content) {
    let result = '';
    const lines = content.split('\n').filter(l => l.trim());

    lines.forEach(line => {
        const match = line.match(/•\s*([^:：]+)[:：]\s*(.+)/);
        if (match) {
            result += `<div class='dl_wrap'><dl><dt>${match[1].trim()}</dt><dd>${match[2].trim()}</dd></dl></div>`;
        }
    });

    return result || content;
}

// 변환 실행
let convertedCount = 0;

wiki.forEach(card => {
    if (card.category === 'swords' || card.category === 'pentacles') {
        const original = card.content;
        card.content = convertToUnitFormat(card.content, card.category);
        if (original !== card.content) {
            convertedCount++;
            console.log(`✅ 변환됨: ${card.title}`);
        }
    }
});

// 파일 저장
fs.writeFileSync(wikiPath, JSON.stringify(wiki, null, 2), 'utf-8');
console.log(`\n총 ${convertedCount}개 카드 변환 완료!`);
