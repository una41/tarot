export const useKakaoShare = () => {
  const config = useRuntimeConfig()

  /**
   * 카카오톡 피드 공유 (링크 - PC 폴백용)
   */
  const fnShareKakao = ({ title, description, imageUrl, webUrl }) => {
    if (!window.Kakao) {
      alert('카카오 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }
    if (!window.Kakao.isInitialized()) {
      if (!config.public.kakaoJsKey) {
        alert('카카오 앱 키가 설정되지 않았습니다.')
        return
      }
      window.Kakao.init(config.public.kakaoJsKey)
    }

    const shareUrl = webUrl || 'https://numerologytarot.uk'
    const shareImage = imageUrl || 'https://numerologytarot.uk/img/main.jpg?v=1'

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: title || '수비학 타로 결과',
        description: description || '나의 타로 리딩 결과를 확인해보세요!',
        imageUrl: shareImage,
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: '앱에서 보기',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      ],
    })
  }

  /**
   * PDF File 객체로 기기 공유 시트 열기 (user gesture 직접 호출 필수)
   * - 미리 준비된 File 객체를 받아 동기적으로 share 호출
   * - Web Share API 미지원 시 Kakao 링크 공유로 폴백
   *
   * @param {File}   file           - 미리 변환된 File 객체
   * @param {Object} kakaoFallback  - 폴백용 Kakao 공유 옵션 { title, description }
   */
  const fnSharePdfFile = (file, kakaoFallback = {}) => {
    if (navigator.canShare?.({ files: [file] })) {
      // navigator.share() 는 user gesture 직접 호출체인에서만 동작
      navigator.share({
        files: [file],
        title: kakaoFallback.title || '수비학 타로 결과',
      }).catch(err => {
        if (err.name !== 'AbortError') console.error('공유 오류:', err)
      })
    } else {
      fnShareKakao(kakaoFallback)
    }
  }

  return { fnShareKakao, fnSharePdfFile }
}
