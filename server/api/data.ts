import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const type = query.type || 'birth' // 기본값은 birth
    
    // assets/data 폴더 내의 파일 경로 설정
    const fileName = type === 'year' ? 'year.json' : 'birth.json'
    const filePath = path.join(process.cwd(), 'assets/data', fileName)

    try {
        const rawData = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(rawData)
    } catch (e) {
        throw createError({
            statusCode: 500,
            statusMessage: `${fileName} 파일을 읽을 수 없습니다.`
        })
    }
})