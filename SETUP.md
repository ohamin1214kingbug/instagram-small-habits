# 작은 습관 Instagram 자동 게시 셋업

구조: 이 폴더를 GitHub 공개 저장소에 올리면, GitHub Actions가 매일 09:00(KST)에
`posts/NN.jpg` + `posts/NN.txt`를 하나씩 Instagram에 게시합니다. Mac이 꺼져 있어도 됩니다.

- 게시 순서: `START_DATE` 당일 = 01번, 다음 날 = 02번 … 큐가 끝나면 아무것도 안 함.
- 콘텐츠 추가: `posts.json`에 항목 추가 → `node render.mjs` → push. 번호는 이어서 붙습니다.

## 1. Instagram 계정 (직접)

1. 새 Instagram 계정을 만듭니다.
2. 설정 → 계정 유형 → **프로페셔널 계정**(크리에이터 또는 비즈니스)으로 전환합니다. 무료입니다.
   개인 계정은 API로 게시할 수 없습니다.

## 2. Meta 앱과 토큰 (직접)

메뉴 이름은 Meta가 자주 바꿔서 아래는 대략적인 경로입니다.

1. https://developers.facebook.com 에 로그인 → 앱 만들기 → Instagram 관련 사용 사례 선택.
2. "Instagram 로그인을 사용한 API 설정"에서 위 계정을 연결하고 **액세스 토큰 생성**.
   권한: `instagram_business_basic`, `instagram_business_content_publish`.
3. 토큰으로 계정 ID 확인 (터미널에서 직접 실행, 토큰을 채팅에 붙여넣지 마세요):

   ```bash
   curl "https://graph.instagram.com/me?fields=user_id,username&access_token=<TOKEN>"
   ```

   응답의 `user_id`가 `IG_USER_ID`입니다.

## 3. GitHub 저장소

1. 저장소 생성과 push (Claude에게 요청해도 됩니다):

   ```bash
   gh repo create instagram-small-habits --public --source . --push
   ```

2. 비밀값 등록 (직접, 붙여넣기 프롬프트가 뜹니다):

   ```bash
   gh secret set IG_TOKEN
   ```

   ```bash
   gh secret set IG_USER_ID
   ```

3. 시작일 등록 (이 날 01번이 올라갑니다):

   ```bash
   gh variable set START_DATE --body 2026-11-12
   ```

4. 바로 테스트하려면 `START_DATE`를 오늘로 두고 수동 실행합니다. **실제로 게시됩니다.**

   ```bash
   gh workflow run post.yml
   ```

## 주의

- **토큰은 60일 뒤 만료됩니다.** 만료 전에 갱신하고 `gh secret set IG_TOKEN`으로 다시 등록하세요.

  ```bash
  curl "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=<TOKEN>"
  ```

- 공개 저장소의 예약 워크플로는 60일간 저장소 활동이 없으면 GitHub가 자동으로 끕니다.
  콘텐츠를 계속 추가해 push하면 문제없습니다.
- 저장소가 공개라서 게시 전 이미지와 캡션도 누구나 볼 수 있습니다.
- 게시에 실패한 날은 재시도하지 않고 건너뜁니다. Actions 탭에서 실패를 확인할 수 있습니다.
- 로컬 확인 (게시 안 함):

  ```bash
  DRY_RUN=1 START_DATE=2026-11-12 IMAGE_BASE_URL=https://example.test/posts bash post.sh
  ```
