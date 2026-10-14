// 찬서 명예의 전당 서버 (Google Apps Script) v10.7
//
// v10.6 → v10.7 바뀐 점 (게임 v433)
// - 🧿 순위 부적: 같은 계정(같은 이름 비밀번호 열쇠 · 없으면 같은 이름)은 한 기간(일간·주간·월간)에 부적 하나만 — 악몽·보스 러시·레이드 3위 안 중 가장 높은 순위 하나. 3위 밖은 그대로 못 받음
//
// v10.5 → v10.6 바뀐 점 (게임 v421) — 클라우드 저장 덮어쓰기 사고 막기
// - 저장(csave)은 그 기기 데이터가 「지금 서버에 있는 저장본」에서 이어진 것일 때만 받음: 게임이 base(불러오거나 마지막으로 올린 서버 저장 시각)를 보내고,
//   서버의 지금 저장 시각과 다르면 거절(err:'stale'). base를 안 보내는 예전 게임 버전도 거절 → 다른 기기·빈 기기가 모르고 덮어쓰지 못함
// - 덮어쓰기 전 이전 저장본을 「계정백업」 시트에 남김: 이름마다 최근 12개. 2시간마다 한 번 + 메달·데이터가 크게 줄어드는 저장·직접 덮어쓰기는 항상
// - 「저장기록」 시트: 저장·거절·되돌리기를 시각·기기·메달·크기와 함께 남김 (최근 4000줄)
// - 관리자(개발자 키): ?cbaks=이름&dk= → 백업 목록·저장 기록 · POST {crestore:1, dk, name, t} → 그 백업으로 되돌림 (지금 저장본도 먼저 백업)
//
// v10.4 → v10.5 바뀐 점 (게임 v397)
// - 모험가가 누군가에게 시비를 걸면 대답에 s:1 표시 → 게임이 다른 모험가 1~2명을 불러 반응하게 함
//
// v10.3 → v10.4 바뀐 점
// - Sonnet에서 thinking:disabled가 거부되던 오류 수정 (between_tools로 생각 없이 바로 대답)
//
// v10.2 → v10.3 바뀐 점
// - AI 모험가 대화 모델을 Haiku → Sonnet으로 (말귀·논리 개선, 토큰당 비용 약 3배)
//
// v10.1 → v10.2 바뀐 점
// - 논리 점검(의도된 컨셉·장난성 모순은 허용): 누가 무슨 말 했는지 구분, 앞뒤 맞는 대답, 남의 화제 끌어오기·자기 모순·없는 말 지어내기 금지
//
// v10.0 → v10.1 바뀐 점
// - 다른 모험가가 이미 한 말·질문(「OO님 뭐함?」 등)을 같은 틀로 반복하지 않음
//
// v9.9 → v10.0 바뀐 점
// - AI 대답에 태그 찌꺼기(<...>·잘린 [기분 표시 등)가 채팅에 섞여 나가던 문제 수정
// - 「죽었다」가 게임 얘기인지 현실 농담인지 구분해서 받아침
//
// v9.8 → v9.9 바뀐 점 (게임 v389)
// - 누가 선 넘는 말을 하면 상관없는 모험가도 참전해서 뭐라 함 (대답에 x:1 표시 → 게임이 다른 모험가들을 더 부름)
// - 맞춤법 지적하는 성격: 진지충(딱딱하게)·별헤는밤(다정하게)·그림자(놀리면서)
// - 맞춤법·띄어쓰기: 대부분 많이 틀림(특히 띄어쓰기), 정확한 건 진지충·원소술사J·포션장인·별헤는밤·성기사단장만
//
// v9.7 → v9.8 바뀐 점
// - 감정 상하면 현실 얘기로 긁는 모험가(도윤이형 현피·랭커지망생 연봉/학벌·달빛·bunny99)
// - 럭키세븐: 농담·받아치기 고수 / 별헤는밤: 어휘력 좋은 똑띠 / 전노고무통현대령: 경상도 사투리
// - 디시 말투 수위 제한 풀음 (「~노」 등 허용, 패드립·진짜 협박만 금지)
// - 혐오 수위: 밈·드립 같은 간접적인 건 허용, 집단을 진지하게 혐오·선동하는 말은 차단
//
// v9.6 → v9.7 바뀐 점
// - AI 모험가에게 감정(기분)이 생김: 삐짐·화남·짜증·우울·서운·신남 등, 대화에 따라 바뀌고 한동안 이어짐 (캐시 ai_mood_N)
// - 대놓고 시비 거는 모험가(알빠노·bunny99·랭커지망생)와 그걸 고깝게 보고 한마디 하는 모험가(진지충·도윤이형·캣맘나비·성기사단장·민트초코·곰도리)
// - 디시 말투 모험가는 가벼운 욕 허용 (집단 비하·일베식 어미는 계속 금지)
//
// v9.5 → v9.6 바뀐 점
// - 일부 남자 모험가(도윤이형·랭커지망생·달빛·총알배송·bunny99·알빠노)는 디시 게임 갤러리 말투를 섞음 (혐오·일베식 표현 금지)
//
// v9.4 → v9.5 바뀐 점 (게임 v388)
// - AI 모험가가 장난(게임 도발·밈)인지 진지한 말인지 구분해서 받아침, 상대 말투·자기 리액션을 따라 하지 않음
//
// v9.3 → v9.4 바뀐 점 (게임 v382)
// - 「닥쳐·말 걸지 마」·무례한 말에 성격대로 반응: 공격적·비판적·사회성 부족한 모험가(bunny99·달빛·도윤이형·원소술사J·랭커지망생·보리아빠·캣맘나비·알빠노·진지충)는 절대 안 들음
//
// v9.2 → v9.3 바뀐 점 (게임 v381)
// - 말 걸지 말라고 한 사람에게 먼저 말 걸 땐 성격대로(눈치 없는 캐릭터만 알고 거는 티) 아니면 패스
// - 관리자가 후원자를 임명·해제 (POST donorSet, GET ?donors) → 게임이 그 이름에게 후원자 칭호·외형·부적을 자동 지급
// - 결투 전적과 함께 결투에 쓴 캐릭터(능력치·장비)를 「결투 캐릭터」 시트에 저장, ?hero=이름&diff=duel 로 읽음
//
// v9.1 → v9.2 바뀐 점 (게임 v380)
// - AI 모험가 6명 추가 (보리아빠·캣맘나비·전노고무통현대령·알빠노·앙메르띠·진지충). 게임의 BOTS 순서와 같아야 함
// - 말을 더 짧고 대충(구어체, 한 문장)으로. 인사·말 걸기도 짧게
// - 계정 정보(pf) 길이 800 → 1200 (끝에 지금 부적 효과가 붙음)
// - 명예의 전당 한마디(cmEdit)를 그 이름의 주인도 고칠 수 있음 (기록은 게임이 자동으로 올리고, 한마디는 나중에) · cls를 주면 그 직업 기록만
//
// v9.0 → v9.1 바뀐 점 (게임 v379)
// - AI 모험가가 대화 흐름(몇 분 전 말인지·누구에게 한 말인지·끝난 화제인지)을 따져서 대답. 자기와 상관없는 남의 대화엔 「(패스)」 → 대답 안 함
// - 같은 말(자기 상황 설명 등) 반복 금지, AI 소리·「대답 금지」에 순순히 따르거나 길게 해명하지 않음, 모험가마다 맞춤법·띄어쓰기·오타 습관이 다름, 더 짧게
//
// v8.9 → v9.0 바뀐 점 (게임 v378)
// - AI 모험가가 접속한 사람에게 먼저 말을 걺: tgt(말 걸 사람), gr=1(방금 들어온 사람에게 인사)
//
// v8.8 → v8.9 바뀐 점 (게임 v377)
// - AI 모험가가 지금 접속한 사람 목록(on)을 보고 그 사람들에게 말을 걸고 대답함 (나간 사람에겐 말 안 검)
//
// v8.7 → v8.8 바뀐 점 (게임 v365)
// - 📤 아이템 보내기: 여러 개를 한 번에 (it = 장비 배열, 최대 40개씩)
// - 🧿 부적 보상을 보스 러시·레이드(종합)에도: 일간·주간·월간 1~3위. 부적 기간키 앞에 BR- / RD- 를 붙여 구분
//
// v8.6 → v8.7 바뀐 점 (게임 v363~364)
// - 모험가 말투: 뜬금없이 시비·욕하는 사람에게는 사실을 짚어 차분하게 받아침
// - 📤 아이템 보내기: POST {mail:1, to, from, k, it} → 보내는 이름의 주인 열쇠가 맞고 받는 이름이 있을 때만 「고용 메달」 시트 7번째 칸(it)에 적어 둠. 받는 사람은 ?gifts= 로 받아 감
// - 다른 유저 말에도 모험가가 대답. 같은 말에 여러 사람 게임이 동시에 부탁해도 한 번만 대답하게 막음 (k = 말한 사람|말 내용, 2분)
//
// v8.5 → v8.6 바뀐 점 (게임 v362)
// - AI 대답을 POST로도 받음 (최근 대화 20줄 + 그 모험가가 예전에 한 말 → 말이 앞뒤로 맞게). 모험가별 말투 규칙
//
// v8.4 → v8.5 바뀐 점 (게임 v360)
// - 🧿 부적 보상: 끝난 일간·주간·월간 무한의 악몽 1~3위에게 부적을 「고용 메달」 시트에 적어 둠 (charm:기간:순위:기간키) → 게임이 ?gifts= 로 받아 감
//   ★ 처음 한 번 setupAwardTrigger 를 실행해 두면 매일 0시 무렵(+ 매시간 확인) 자동으로 나눠 줌
//
// v8.3 → v8.4 바뀐 점 (게임 v357)
// - AI 모험가 대답: 사람이 채팅하면 그 사람 게임이 ?ai=1&b=봇번호&ctx=최근채팅 을 부르고, 서버가 Claude(Haiku)로 그 봇 말투의 한 줄을 만들어 돌려줌
//   스크립트 속성 ANTHROPIC_KEY 가 있어야 켜짐 (없으면 꺼짐, 키는 코드에 넣지 않음). 하루 최대 AI_DAY번, 전체 AI_GAP초 간격
//
// v8.2 → v8.3 바뀐 점 (게임 v356)
// - 레이드 고용 수수료: 레이드에 명예의 전당 캐릭터를 동료로 데려가면 수수료 메달이 「고용 메달」 시트에 쌓임
//   (POST {hire:1, to, from, m, cls, rb}). 받는 사람은 ?gifts=이름&k=열쇠 로 받아 가고, 받아 간 줄은 지워짐 (이름 주인 열쇠가 맞을 때만)
//
// v8.1 → v8.2 바뀐 점 (게임 v356)
// - 기간별 명예의 전당 (월간·주간·일간): 게임이 기록을 올릴 때 diff 뒤에 「|D20261013」(그날)·「|W20261012」(그 주 월요일)·「|M202610」(그 달)을 붙여 한 번씩 더 보냄
//   → 그 기간 안에서 이름·직업마다 가장 좋은 기록이 따로 남음. 점수는 앞쪽 난이도로 계산
// - 목록에는 지금 기간(한국 시각)의 기간 기록만 나감. 지난 기간 줄은 기록이 올라올 때 가끔 정리해서 지움
//
// v8.0 → v8.1 바뀐 점 (게임 v310)
// - 기록 외형 채우기(fill)에 ow=1이면 이름 주인이 자기 기록의 외형을 지금 장비 모습으로 덮어쓸 수 있음 (예전엔 비어 있을 때만)
//
// v7.9 → v8.0 바뀐 점 (게임 v309) — 보안
// - 개발자 키를 코드에서 지우고 스크립트 속성 DEV_KEY 에서 읽음 (예전 키는 공개 저장소에 노출돼 있었음 → 새 키로 바뀜)
//   설정: Apps Script 편집기 → 왼쪽 ⚙ 프로젝트 설정 → 스크립트 속성 → 속성 추가: 이름 DEV_KEY, 값은 따로 받은 64자리 키
//
// v7.8 → v7.9 바뀐 점 (게임 v304)
// - 결투 전적(dw)에 결투에 쓴 캐릭터(직업·옷차림·외형·이름)를 함께 저장: "3-0-0-c:mage:옷차림:외형:이름" → "w3d0l0|mage|옷차림|외형|이름"
//   (예전엔 결투 전당 줄의 그림·한마디를 그 이름의 최고 점수 기록에서 가져와서, 결투 안 한 캐릭터가 보였음)
//
// v7.7 → v7.8 바뀐 점 (게임 v299)
// - 명예의 전당을 직업마다 따로 저장: 이름 + 난이도 + 직업마다 한 줄 (레이드는 지금처럼 이름 + 레이드 보스마다 한 줄)
//   다른 직업으로 낸 기록은 점수가 낮아도 따로 올라가고, 같은 직업끼리만 더 높은 점수로 바뀜
// - 캐릭터 내려받기(?hero=)·기록 삭제(?delrec=)에 직업(cls)을 같이 받음 (없으면 예전처럼 이름 + 난이도)
//
// v7.6 → v7.7 바뀐 점 (게임 v267)
// - 무한의 악몽 점수식 v4(SC4_AT 이후 기록): 보스 점수·클리어 보너스 없음, 레벨 점수 ×3
//   (손으로 해내는 플레이 보너스 ×2는 게임이 보너스 값에 이미 반영해서 보냄)
//
// v7.5 → v7.6 바뀐 점
// - 플레이 보너스 점수에 상한(BONUS_MAX)을 둠: 숫자가 아니거나 너무 큰 값(무한대 등)이 오면 상한으로 자름
//   (무한대 점수가 한 번 들어가면 아무도 못 넘고 지우기 전엔 그대로 남던 문제)
// - 악몽 새 기록의 시간 환산을 게임과 똑같이 반올림 (홀수 초에서 게임·서버 점수가 조금 달라 '내 기록' 표시가 어긋나던 문제)
//
// v7.4 → v7.5 바뀐 점
// - 레이드가 보스 5종으로 나뉨: 보스마다 따로 기록 (raid_golem · raid_frost · raid_storm · raid_brood · raid_void).
//   점수는 예전 레이드와 같은 식(단계 × 100만 − 처치 시간). 예전 레이드(raid) 기록은 그대로 남음
//
// v7.3 → v7.4 바뀐 점
// - 예전 기록의 빈 외모 칸 채우기(fill): 그 이름의 주인 기기만, 기록의 옷차림(장비 외형)·장비 상세 칸이 비어 있을 때만 채움.
//   점수·시각·다른 칸은 그대로. 다른 사람 화면의 명예의 전당에도 그 캐릭터의 모습이 보이게
//
// v7.2 → v7.3 바뀐 점
// - 기록의 직업 칸(cls) 길이 120 → 700자: 클리어 당시 장비 상세를 같이 저장해 명예의 전당에서 장비 설명·합산 효과가 보임
//
// v7.1 → v7.2 바뀐 점
// - 점수식을 게임(v207)과 맞춤: 생존 시간 점수 ×1.5, 처치 점수는 2000점부터 완만하게, 레벨 점수는 v197 이후 기록 ×1.6
//
// v7.0 → v7.1 바뀐 점
// - 프로필(pf) 길이 240 → 800자: 장비 상세(옵션·세트)를 같이 실어 다른 사람 장비에 마우스를 올리면 설명·합산 효과가 보임
//
// v6.9 → v7.0 바뀐 점
// - 접속 신호 응답의 접속자 목록에 각자의 프로필(pf)을 같이 실어 보냄 → 접속자 이름에 마우스를 올리면 바로 캐릭터 정보가 보임
//
// v6.8 → v6.9 바뀐 점
// - 개발자 기기 기록: 마지막 접속 시각을 30분 → 2분마다 갱신 (누가 몇 분에 마지막으로 접속했는지)
//
// v6.7 → v6.8 바뀐 점
// - 계정 정보: 접속 신호(ping)에 실려 오는 프로필(대표 캐릭터·장비·전투력·플레이 시간)을 이름별로 캐시에 보관 (이름 주인만 갱신)
// - ?prof=이름 으로 그 프로필을 돌려줌 (접속자 이름에 마우스를 올리거나 누르면 게임이 불러옴)
// 기존 Apps Script 프로젝트의 코드를 전부 지우고 이걸 붙여넣은 뒤
// 배포 > 배포 관리 > 연필(수정) > 버전: 새 버전 > 배포  (URL은 그대로 유지됨)
//
// v6.6 → v6.7 바뀐 점
// - 보스 러시 새 규칙 기록(BR_AT 이후)은 최종 점수 ×2 (BR_SM). 게임 화면과 같은 식
//
// v6.5 → v6.6 바뀐 점
// - 보안: 기록의 직업 칸(cls)에서 HTML 특수문자(< > " ' ` & \\)를 지움 (명예의 전당에 코드가 심어지는 것 방지)
//
// v6.4 → v6.5 바뀐 점
// - 이름 비밀번호 맞히기 막기: 한 이름에 틀린 열쇠가 10분 구간에 40번 넘게 오면 잠시 확인을 멈춤 (?own · cload)
// - 관리자가 기록을 지우면 이름 주인 정보도 바로 새로 고침, 지운 기록을 옛 기기가 다시 올려도 이름을 가져가지 않음
// - 예전 서버에서 보통으로 저장된 보스 러시 기록이 새 기록과 따로 두 줄이 되던 문제
// - 서버가 바쁠 때 채팅·접속 기록이 오류 대신 busy로 응답, 클라우드 저장·응원·쪽지는 전당 목록 캐시를 비우지 않음
//
// v6.3 → v6.4 바뀐 점
// - 이름 주인 열쇠 칸(N열)을 글자 형식으로 고정: 열쇠가 +로 시작하면 시트가 수식으로 읽어 #ERROR!가 되어 진짜 주인도 「비밀번호가 맞지 않아요」로 막히던 문제. 이미 깨진 칸은 주인 없음으로 봄
// - 이름 비교 통일 (한글 조합 방식 NFC · 보이지 않는 글자 제거)
// - 쪽지: 6시간 넘게 안 들어와도 다음 접속 때 받음, 이름 주인 기기만 받고 읽음 처리 (접속 신호에 열쇠 k 필요)
// - 서버가 바쁠 때 기록 요청이 오류로 사라지지 않고 busy로 응답
// - 더 좋은 기록으로 바뀔 때 결투 전적·캐릭터 정보를 지우지 않음
//
// v6.2 → v6.3 바뀐 점
// - 관리자 개인 메시지(쪽지): 개발자 키로 이름에 쪽지를 보내면 「쪽지」 시트에 저장 → 그 이름이 접속 신호(ping)를 보낼 때 같이 받아 화면 가운데 팝업으로 봄
//   POST {dm:1, dk, to, msg} · 받은 사람 확인 ?dmack=번호&n=이름 · 관리자 목록 ?dms=1&dk=
//
// v6.1 → v6.2 바뀐 점
// - 관리자가 이름 비밀번호를 직접 정해 줌 (POST rekey + 개발자 키): 지금 주인과 상관없이 그 이름 열쇠를 이름+비밀번호 열쇠로 바꿈
//   (주인을 지운 사이에 그 사람의 다른 기기가 자동 저장으로 이름을 다시 가져가 비밀번호가 계속 틀리던 문제 해결용)
//
// v6.0 → v6.1 바뀐 점
// - 멘트는 기록을 처음 올리거나 더 좋은 기록으로 바뀔 때만 저장 (점수가 안 오른 기록을 다시 올려 멘트만 바꾸던 구멍 막음)
// - 멘트 고치기(cmEdit)는 개발자 키가 있을 때만 (부적절한 멘트 정리용)
//
// v5.9 → v6.0 바뀐 점
// - 모든 이름 주인 초기화 (개발자 키): ?unownall=1&dk= → 전당 기록·계정 시트의 주인 열쇠를 전부 지움. 그 뒤 각 이름으로 처음 올리는 기기가 새 주인
//
// v5.8 → v5.9 바뀐 점
// - 이름 주인 초기화(개발자)가 「계정」 시트의 주인 열쇠도 같이 지움 (예전엔 계정 시트에 남아 초기화가 안 먹었음)
//
// v5.7 → v5.8 바뀐 점
// - 멘트 고치기: POST {cmEdit:1, name, diff, k, comment} → 이름 주인 열쇠가 맞으면 그 기록의 멘트만 바꿈 (빈 칸이면 지움)
//
// v5.6 → v5.7 바뀐 점
// - 기록 삭제(개발자)를 「삭제」 시트에 남김: 삭제한 시각 이전에 세운 기록은 기기가 다시 올려도 받지 않음 (삭제 뒤 새로 세운 기록은 정상)
// - ?dels=1 → 삭제 목록. 게임이 켤 때 받아서 그 기기에 남은 사본(내 최고 기록)도 지움
//
// v5.5 → v5.6 바뀐 점
// - 「계정」 시트: 이름 비밀번호(주인 열쇠)를 명예의 전당 기록과 따로 오래 보관 → 전당 기록이 없는 이름도 비밀번호가 계속 유지됨
// - 이름+비밀번호 데이터 저장: 판이 끝날 때 게임이 데이터(코드 복붙과 같은 내용)를 올리고, 다른 기기에서 이름+비밀번호로 불러옴
//   POST {csave:1, name, k, at, md, data} · GET ?cload=이름&k=열쇠 (주인 열쇠가 맞을 때만)
//
// v5.4 → v5.5 바뀐 점
// - 무한의 악몽 새 규칙 기록(SC3_AT 이후)은 최종 점수 ×2 (NM_SM). 게임 화면과 같은 식
//
// v5.3 → v5.4 바뀐 점
// - 기록 시각(at)을 게임이 보낸 값으로 저장 (이 기기에만 남았던 예전 기록을 다시 올릴 때 그 당시 점수식 적용)
//
// v5.2 → v5.3 바뀐 점
// - 기록 비교·순위를 게임 화면과 같은 '최종 점수'(플레이 보너스·자동 비율 포함)로 함. 예전엔 보너스를 뺀 점수로 비교해서
//   보너스가 큰 좋은 기록이 보너스 적은 새 기록에 덮여 사라질 수 있었음
// - 목록에 기록 시각(at)을 같이 보냄 → 게임이 기록 버전별 점수식(v1·v2·악몽 v3)을 정확히 적용
// - 악몽 v3 점수식(SC3_AT 이후): 생존 시간을 NM_TK(1.5)배로 환산. v2(10분 이후 제곱)는 폐지 → 모든 기록을 v1 식으로 (전당은 원래 v1로 보여 줬음)
// - 레이드 기록(diff=raid): 점수 = 단계 × 100만 − 처치 시간(초)
// - 기록 삭제 (개발자 키): ?delrec=이름&diff=난이도&dk= → 그 이름·난이도의 명예의 전당 기록 줄을 지움
//
// v5.1 → v5.2 바뀐 점
// - 점수 계산식 v2: 새로 올라오는 기록부터 10분 이후 생존 점수가 커지고 보스 처치 800점 (예전 기록 점수는 그대로)
// v5.0 → v5.1 바뀐 점
// - 접속 중 목록에 게임 버전(b)과 짧은 기기 표시(u)를 같이 돌려줌 (개발자 모드에서 버전 확인·관전용)
// - 이름 주인 초기화 (개발자 키): ?unown=이름&dk= → 그 이름의 주인 열쇠를 지움 (다른 기기로 옮겨 쓰다 막힌 경우)
// - 간이 관전 (개발자 키가 맞을 때만, 한 사람당 관전자 1명): ?spec=u&me=&dk= 로 관전 시작/계속 → 그 사람의 최근 상태를 돌려줌
//   관전당하는 게임은 ping 응답의 w=1을 보고 1.5초마다 ?snap=1&id=&d=상태 를 보냄 (보는 사람이 없으면 w=0 → 멈춤). 상태는 캐시에만 둠
//
// v4.9 → v5.0 바뀐 점
// - 기기별 접속 기록: 접속 신호(ping)가 올 때 '기기' 시트에 기기 표시 · 이름 · 기기 종류 · 처음/마지막 접속을 남김
//   (같은 기기+이름은 30분에 한 번만 시트를 고침). 개발자 모드 화면에서만 ?dv=1&dk=개발자키 로 받아봄
//
// v4.8 → v4.9 바뀐 점
// - 후원 응원 메시지: 게임의 후원 창에서 보낸 메시지를 '후원' 시트에 저장 (시간 · 이름 · 메시지)
//   ?sup=1&after=시간 으로 그 뒤 메시지를 받아감 (개발자 모드 화면에 띄움)
//
// v4.7 → v4.8 바뀐 점
// - 이름 비밀번호: 게임이 이름+비밀번호로 만든 열쇠로 바꿔 달라고 하면(rekey), 지금 주인이거나 주인이 없을 때만 바꿔 줌
//   → 다른 컴퓨터에서도 같은 이름+비밀번호면 주인으로 인정
//
// v4.6 → v4.7 바뀐 점
// - 채팅·접속 중 목록에 이름 효과(fx: 금빛 이름 등, 게임에서 메달로 산 것)를 같이 저장해서 보여줌
//
// v4.5 → v4.6 바뀐 점
// - 채팅·이름 확인이 빨라짐: 이름 주인 정보를 캐시에 10분 기억해서 메시지마다 시트를 읽지 않음
// - 같은 기기가 같은 말을 30초 안에 또 보내면 한 번만 남김 (한글 입력 Enter가 두 번 들어가는 문제)
//
// v4.4 → v4.5 바뀐 점
// - 전체 채팅: ?chat=1 최근 메시지 받기, ?say=내용&id=&n=이름&k=열쇠 보내기
//   최근 60개만 스크립트 속성(PropertiesService, 15개씩 4칸)에 저장하고 오래된 건 자동으로 지움 (시트 안 씀)
//   주인이 있는 이름은 그 열쇠로만 말할 수 있음. 한 기기당 3초에 한 번까지
//   채팅을 모두 지우려면: 편집기에서 clearChat 함수를 골라 실행
// - 접속 신호(ping) 응답에 마지막 채팅 시간(ct)을 같이 줌 (새 메시지 알림용)
//
// v4.3 → v4.4 바뀐 점
// - 지금 접속 중인 사람: 게임이 1분마다 ?ping=1&id=&n=이름&a=하는것 을 보냄 → 최근 2분 안에 보낸 사람 목록을 돌려줌
//   (시트는 건드리지 않고 캐시에만 둠. id는 기기 열쇠를 바꾼 값이라 열쇠가 드러나지 않음)
//
// v4.2 → v4.3 바뀐 점
// - 이름 주인 확인: 게임이 기기마다 만든 비밀 열쇠(k)를 같이 보냄. 서버는 열쇠를 바꾼 값(kh 칸)만 저장
//   그 이름으로 처음 열쇠와 함께 올린 기기가 주인이 되고, 다른 열쇠로 오는 기록·결투 전적은 받지 않음
//   (기기를 잃어버렸으면 시트에서 그 이름 줄들의 kh 칸을 지우면 다시 주인을 정할 수 있음. '익명'은 주인 없음)
// - ?own=이름&k=열쇠 : 그 이름을 이 열쇠로 쓸 수 있는지 미리 확인 (게임이 등록 전에 물어봄)
//
// v4.1 → v4.2 바뀐 점
// - 직업 칸 40자 → 120자 (칭호·오라·장비 정보가 뒤에 붙으면서 잘리던 문제)
// - 결투 전적 칸(dw, "w승d무l패") 추가: 기록을 올릴 때, 그리고 결투가 끝날 때마다 그 이름의 모든 기록에 갱신
//
// v4 → v4.1 바뀐 점
// - 목록을 1분 동안 저장해 두고 바로 돌려줌 (기록이 올라오면 바로 새로 만듦) → 랭킹 불러오기가 빨라짐
// - 목록을 만들 때 무거운 캐릭터(hero) 칸은 읽지 않고, 캐릭터가 있는지는 따로 적어 둔 표시(hh 칸)로 판단
//
// v3 → v4 바뀐 점
// - 기록마다 '캐릭터' 칸(hero) 추가: 그 판의 증강·능력치를 압축한 문자열 → 게임의 ⚔ 결투에서 실제 캐릭터와 싸울 수 있음
// - 목록(doGet)에는 캐릭터가 있는지(h)만 주고, 캐릭터는 ?hero=이름&diff=난이도 로 따로 받아감 (목록이 무거워지지 않게)
// - 보스 러시(bossrush) 난이도 인식. 예전에 '일반'으로 잘못 저장된 보스 러시 기록도 목록에선 보스 러시로 보여줌
// - 예전 v3 시트는 그대로 쓰고 맨 오른쪽에 hero 칸만 추가됨 (기록 유지)
//
// v2 → v3 바뀐 점
// - 난이도별로 따로 저장 (이름 + 난이도마다 한 줄). 예전엔 이름당 한 줄이라 난이도끼리 기록을 덮어씀
// - 직업 칸 12자 → 40자 (예: "knight:nightmare#hf_gold"가 잘려서 악몽 기록이 사라지던 문제)
// - 점수는 게임과 같은 식으로 서버에서 다시 계산 (골드 제외, 처치 완만한 상한, 클리어 보너스, 난이도 배율)
// - 목록은 난이도마다 상위 50개씩
// - 처음 실행하면 v2 시트(ranking_v2)의 기록을 자동으로 옮김 (v2 시트는 그대로 남겨둠)

const SHEET_NAME = 'ranking_v3';
const OLD_SHEET = 'ranking_v2';
const HEAD = ['name', 'diff', 'cls', 'time', 'lvl', 'kills', 'bosses', 'score', 'comment', 'at', 'hero', 'hh', 'dw', 'kh'];
const LIST_COLS = 10; // 목록에 필요한 칸 (name ~ at)
const CACHE_KEY = 'list_v43';
const DIFFS = { normal: 1, hard: 1.5, hell: 2.2, god: 3.2, nightmare: 4, bossrush: 4, raid: 1, raid_golem: 1, raid_frost: 1, raid_storm: 1, raid_brood: 1, raid_void: 1 };

function book_() {
  const a = SpreadsheetApp.getActiveSpreadsheet();
  if (a) return a;
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty('BOOK');
  if (id) return SpreadsheetApp.openById(id);
  const b = SpreadsheetApp.create('찬서 랭킹');
  p.setProperty('BOOK', b.getId());
  return b;
}

// v8.2 기간 키 (한국 시각): D=그날, W=그 주 월요일, M=그 달
const PER_RE = /^(D\d{8}|W\d{8}|M\d{6})$/;
function perKey_(p, t) { const d = new Date((t || Date.now()) + 9 * 3600e3), y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, dd = d.getUTCDate(), z = n => String(n).padStart(2, '0');
  if (p === 'M') return 'M' + y + z(m); if (p === 'D') return 'D' + y + z(m) + z(dd);
  const w = new Date(Date.UTC(y, m - 1, dd - ((d.getUTCDay() + 6) % 7))); return 'W' + w.getUTCFullYear() + z(w.getUTCMonth() + 1) + z(w.getUTCDate()); }
const curPers_ = () => [perKey_('D'), perKey_('W'), perKey_('M')];
const baseDiff_ = d => String(d || '').split('|')[0];
// "knight:nightm" 처럼 예전에 잘린 난이도도 알아봄 (v8.2: 뒤에 |기간 이 붙어 있으면 그대로 살림)
function diffOf_(d, cls) {
  { const sp = String(d || '').split('|'); if (sp.length === 2 && PER_RE.test(sp[1])) return diffOf_(sp[0], cls) + '|' + sp[1]; }
  let k = String(d || '');
  if (!k) { const c = String(cls || '').split('#')[0]; k = c.indexOf(':') >= 0 ? c.split(':')[1] : 'normal'; }
  if (DIFFS[k]) return k;
  const hit = Object.keys(DIFFS).find(x => k && x.indexOf(k) === 0);
  return hit || 'normal';
}

function sheet_() {
  const ss = book_();
  let s = ss.getSheetByName(SHEET_NAME);
  // 주인 열쇠 칸(N열)은 글자 형식으로 고정 (한 번만). 열쇠가 +로 시작하면 시트가 수식으로 읽어 #ERROR!가 되어 진짜 주인도 막혔음
  if (s) { try { const c = CacheService.getScriptCache(); if (!c.get('khfmt')) { s.getRange('N:N').setNumberFormat('@'); c.put('khfmt', '1', 21600); } } catch (err) {} }
  if (!s) {
    s = ss.insertSheet(SHEET_NAME);
    s.getRange(1, 1, 1, HEAD.length).setValues([HEAD]);
    s.getRange('A:A').setNumberFormat('@');
    s.getRange('C:C').setNumberFormat('@');
    s.getRange('I:I').setNumberFormat('@');
    s.getRange('N:N').setNumberFormat('@');
    const old = ss.getSheetByName(OLD_SHEET);
    if (old && old.getLastRow() > 1) {
      const v = old.getDataRange().getValues();
      const h = v.shift().map(String);
      const rows = v.map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])))
        .map(o => clean_({ ...o, diff: diffOf_('', o.cls) }, o.at))
        .map(r => HEAD.map(k => r[k]));
      if (rows.length) s.getRange(2, 1, rows.length, HEAD.length).setValues(rows);
    }
  }
  // v3 시트에 hero 칸이 없으면 머리글만 추가 (기존 기록은 그대로)
  if (s.getLastColumn() < HEAD.length) {
    s.getRange(1, 1, 1, HEAD.length).setValues([HEAD]);
    // v4 기록 중 캐릭터가 있는 줄에 hh 표시 한 번만 채움
    const last = s.getLastRow(), hc = HEAD.indexOf('hero') + 1;
    if (last > 1) s.getRange(2, hc + 1, last - 1, 1).setValues(s.getRange(2, hc, last - 1, 1).getValues().map(r => [r[0] ? 1 : '']));
  }
  return s;
}

const num_ = (v, max) => Math.max(0, Math.min(max, Math.floor(+v || 0)));
const str_ = (v, n) => { let t = String(v || ''); try { t = t.normalize('NFC'); } catch (err) {} return t.replace(/[\u200b-\u200f\ufeff]/g, '').replace(/\s+/g, ' ').trim().replace(/^[=+\-@]+/, '').slice(0, n); };
// 결투 전적 "승-무-패"
// 시트가 날짜로 바꾸지 않게 "w3d1l2" 꼴로 저장
const dw_ = v => { const m = String(v || '').match(/^(\d{1,6})-(\d{1,6})-(\d{1,6})(?:-c:([a-z]{2,10}):([0-9a-z\-]{0,14}):([A-Za-z0-9_]{0,24}):([^:|]{0,16}))?$/); return m ? 'w' + m[1] + 'd' + m[2] + 'l' + m[3] + (m[4] ? '|' + m[4] + '|' + m[5] + '|' + m[6] + '|' + m[7] : '') : ''; };
const softC_ = (x, c) => x <= c ? x : c * (1 + Math.log(x / c));
// 점수 계산식 v2 (게임과 같음): 이 시각 이후 기록은 10분 이후 생존 점수가 커지고 보스 처치 800점
const SC4_AT = 1791753300000, nmV4_ = r => r.diff === 'nightmare' && (+r.at || 0) >= SC4_AT;
const SC_TW = 1.5, SC_KC = 2000, LV_AT = 1791609893000, lvPts_ = r => (+r.lvl || 0) * 30 * ((+r.at || 0) >= LV_AT ? 1.6 : 1) * (nmV4_(r) ? 3 : 1);
const SC2_AT = 1791462600000, SC3_AT = 1791493000000, NM_TK = 1.5, NM_SM = 2;
const BONUS_MAX = 2000000; // 플레이 보너스 상한 (보통 판은 수천~수만)
const BR_AT = 1791547600000, BR_SM = 2; // 보스 러시 새 규칙 기록은 최종 점수 ×BR_SM (게임과 같은 값)
const timePts_ = (t, v2) => !v2 || t <= 600 ? t * 12 : 7200 + 12 * ((t - 600) + (t - 600) * (t - 600) / 240);

function clean_(d, at) {
  const r = {
    name: str_(d.name, 12) || '익명',
    cls: str_(d.cls, 700).replace(/[<>"'`&\\]/g, ''), // 직업 칸에 HTML이 섞여 들어오지 않게
    time: num_(d.time, 360000),
    lvl: num_(d.lvl, 100000),
    kills: num_(d.kills, 10000000),
    bosses: num_(d.bosses, 10000),
    comment: str_(d.comment, 40),
    at: at || Date.now(),
    // 캐릭터: 압축 문자열 (base64 글자만, 한 칸 최대 45000자)
    hero: String(d.hero || '').replace(/[^A-Za-z0-9+\/=:]/g, '').slice(0, 45000),
  };
  r.hh = r.hero ? 1 : '';
  r.dw = dw_(d.dw);
  r.kh = String(d.kh || '');
  r.diff = diffOf_(d.diff, r.cls);
  // 점수는 서버에서 다시 계산 (조작 방지). 게임과 같은 식
  r.score = score_(r);
  return r;
}

// 게임과 같은 최종 점수: (기본 + 플레이 보너스) × 난이도 배율 × (1 − 0.1 × 자동 비율). 보너스·자동 비율은 cls의 ~칸에 들어 있음
function score_(r0) {
  const r = { ...r0, diff: baseDiff_(r0.diff) };
  if (String(r.diff).indexOf('raid') === 0) return Math.max(0, r.lvl * 1000000 - Math.min(999999, r.time));
  const seg = String(r.cls || '').split('~'), bonus = Math.min(BONUS_MAX, Math.max(0, isFinite(+seg[1]) ? +seg[1] : 0)), ap = Math.min(1, Math.max(0, (+seg[2] || 0) / 100)), v2 = false; // v2(제곱 시간 점수)는 v5.3에서 폐지: 게임 화면과 같게 모든 기록 v1 식
  const base = r.diff === 'bossrush'
    ? r.bosses * 2500 + lvPts_(r) + r.time * 2
    : timePts_(r.diff === 'nightmare' && +r.at >= SC3_AT ? r.time + Math.round(r.time * (NM_TK - 1)) : r.time, v2) * SC_TW + softC_(r.kills * 2, SC_KC) + lvPts_(r) + (nmV4_(r) ? 0 : r.bosses * (v2 ? 800 : 400) + (r.bosses >= 4 ? 3000 : 0));
  const sm = r.diff === 'nightmare' && +r.at >= SC3_AT ? NM_SM : r.diff === 'bossrush' && +r.at >= BR_AT ? BR_SM : 1;
  return Math.round(Math.round((base + bonus) * (DIFFS[r.diff] || 1)) * sm * (1 - 0.1 * ap));
}
// v8.2 지난 기간(일간·주간·월간) 기록 줄 지우기: 한 시간에 한 번까지
// v8.5 🧿 부적 보상: 끝난 기간(어제·지난주·지난달)의 무한의 악몽 순위 1~3위(이름마다 최고 기록 하나)를 「고용 메달」 시트에 부적으로 적어 둠 → 그 사람이 접속하면 받아 감
// 한 기간에 한 번만 (스크립트 속성 aw_기간키). 기간 줄을 지우기 전에, 그리고 매일 0시 트리거(awardTick)에서 실행
function awardPeriods_(s) {
  try {
    const P = PropertiesService.getScriptProperties(), now = Date.now(), d = new Date(now + 9 * 3600e3), y = d.getUTCFullYear(), m = d.getUTCMonth();
    const prevM = Date.UTC(y, m, 1) - 9 * 3600e3 - 1000, keys = [['D', perKey_('D', now - 864e5)], ['W', perKey_('W', now - 7 * 864e5)], ['M', perKey_('M', prevM)]];
    // v8.8 모드: 무한의 악몽(nm) · 보스 러시(br) · 레이드 종합(rd = 보스마다 최고 (단계×1000 + 빠른 처치 보너스 최대 300)의 합)
    const MODES = [['nm', '', '무한의 악몽'], ['br', 'BR-', '보스 러시'], ['rd', 'RD-', '레이드']];
    const todo = [];
    keys.forEach(([p, k]) => { if (k === perKey_(p)) return; MODES.forEach(([md, pre, lab]) => { const ak = 'aw_' + (md === 'nm' ? '' : md + '_') + k; if (!P.getProperty(ak)) todo.push({ p, k, md, pre, lab, ak }); }); });
    if (!todo.length) return;
    const last = s.getLastRow(); if (last < 2) { todo.forEach(t => P.setProperty(t.ak, '1')); return; }
    const iS = HEAD.indexOf('score'), iT = HEAD.indexOf('time'), iL = HEAD.indexOf('lvl'), iK = HEAD.indexOf('kh');
    const v = s.getRange(2, 1, last - 1, Math.max(iS, iK) + 1).getValues(), gs = giftSheet_();
    // v10.7 같은 계정(이름 주인 열쇠가 같으면 한 계정, 없으면 이름)은 한 기간에 부적 하나만: 모드(악몽·보스 러시·레이드)마다 3위 안에 든 것 중 가장 높은 순위 하나
    //       (같으면 악몽 > 보스 러시 > 레이드). 한 모드 순위도 계정 기준(부계정 이름은 빠짐). 다른 모드 자리는 넘기지 않음 (그 모드 3위 안에 든 사람만 받음)
    const acct = {}; v.forEach(r => { const nm = String(r[0]), kh = String(r[iK] || ''); if (nm && kh && !acct[nm]) acct[nm] = kh; });
    const acOf = nm => acct[nm] ? 'k:' + acct[nm] : 'n:' + nm, MO = { nm: 0, br: 1, rd: 2 }, cand = [];
    todo.forEach(t => {
      const best = {};
      if (t.md === 'rd') {
        const per = {};
        v.forEach(r => { const mm = /^raid_(\w+)\|(.+)$/.exec(String(r[1])); if (!mm || mm[2] !== t.k) return; const nm = String(r[0]); if (!nm || nm === '익명') return; const pt = (+r[iL] || 0) * 1000 + Math.max(0, 300 - (+r[iT] || 0)); const o = per[nm] || (per[nm] = {}); if (!o[mm[1]] || pt > o[mm[1]]) o[mm[1]] = pt; });
        Object.keys(per).forEach(nm => { best[nm] = Object.keys(per[nm]).reduce((a, b) => a + per[nm][b], 0); });
      } else {
        const df = (t.md === 'nm' ? 'nightmare|' : 'bossrush|') + t.k;
        v.forEach(r => { if (String(r[1]) !== df) return; const nm = String(r[0]), sc = +r[iS] || 0; if (!nm || nm === '익명') return; if (!best[nm] || sc > best[nm]) best[nm] = sc; });
      }
      /* 한 모드 안에서는 계정마다 가장 좋은 이름 하나로 순위를 셈 (부계정 이름이 자리를 차지하지 않게) */const seen = {}, L = Object.keys(best).filter(nm => best[nm] > 0).sort((a, b) => best[b] - best[a]).filter(nm => { const ac = acOf(nm); if (seen[ac]) return false; seen[ac] = 1; return true; });
      L.slice(0, 3).forEach((nm, i) => cand.push({ t, nm, r: i + 1, ac: acOf(nm) }));
    });
    // 기간(일간·주간·월간)별로 계정마다 가장 좋은 하나만
    const pick = {};
    cand.forEach(c => { const key = c.t.p + '|' + c.t.k + '|' + c.ac, o = pick[key]; if (!o || c.r < o.r || (c.r === o.r && MO[c.t.md] < MO[o.t.md])) pick[key] = c; });
    Object.keys(pick).forEach(key => { const c = pick[key]; gs.appendRow([now, c.nm, '명예의 전당', 0, 'charm:' + c.t.p + ':' + c.r + ':' + c.t.pre + c.t.k, c.t.lab]); });
    todo.forEach(t => P.setProperty(t.ak, '1'));
  } catch (err) {}
}
// ★ 한 번만: 편집기에서 setupAwardTrigger 를 골라 ▶ 실행 → 매일 한국 시각 0시 무렵 awardTick 이 돌아 부적을 나눠 줌
function setupAwardTrigger() { ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'awardTick').forEach(t => ScriptApp.deleteTrigger(t)); ScriptApp.newTrigger('awardTick').timeBased().atHour(0).nearMinute(1).everyDays(1).inTimezone('Asia/Seoul').create(); ScriptApp.newTrigger('awardTick').timeBased().everyHours(1).create(); }
function awardTick() { const lock = LockService.getScriptLock(); if (!lock.tryLock(20000)) return; try { awardPeriods_(sheet_()); } finally { lock.releaseLock(); } }
function prunePer_(s) {
  awardPeriods_(s);
  try { const c = CacheService.getScriptCache(); if (c.get('perPrune')) return; c.put('perPrune', '1', 3600);
    const last = s.getLastRow(); if (last < 2) return; const cur = curPers_(), v = s.getRange(2, 2, last - 1, 1).getValues();
    for (let i = v.length - 1; i >= 0; i--) { const p = String(v[i][0]).split('|')[1]; if (p && cur.indexOf(p) < 0) s.deleteRow(i + 2); }
  } catch (err) {}
}
function rows_(s) {
  const v = s.getDataRange().getValues();
  v.shift();
  return v.map(r => Object.fromEntries(HEAD.map((h, i) => [h, r[i]])));
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// 예전에 일반(normal)으로 잘못 저장된 보스 러시 기록 바로잡기
const fixDiff_ = r => (String(r.diff) === 'normal' && String(r.cls).indexOf(':bossrush') >= 0) ? 'bossrush' : String(r.diff || 'normal');

function listJson_() {
  const s = sheet_();
  const last = s.getLastRow();
  if (last < 2) return '[]';
  // 목록 칸(name~at)과 캐릭터 표시(hh)만 읽음. 무거운 hero 칸은 안 읽음
  const v = s.getRange(2, 1, last - 1, LIST_COLS).getValues();
  const hc = HEAD.indexOf('hh') + 1, ex = s.getLastColumn() >= hc + 1 ? s.getRange(2, hc, last - 1, 2).getValues() : [];
  const all = v.map((r, i) => { const o = Object.fromEntries(HEAD.slice(0, LIST_COLS).map((h, j) => [h, r[j]]));
      return { name: String(o.name), diff: fixDiff_(o), cls: String(o.cls), at: +o.at || 0, time: +o.time, lvl: +o.lvl, kills: +o.kills, bosses: +o.bosses, comment: String(o.comment || ''), score: score_({ diff: fixDiff_(o), cls: String(o.cls), time: +o.time || 0, lvl: +o.lvl || 0, kills: +o.kills || 0, bosses: +o.bosses || 0, at: +o.at || 0 }), h: ex[i] && ex[i][0] ? 1 : 0, dw: ex[i] ? String(ex[i][1] || '') : '' }; })
    .filter(r => { const p = String(r.diff).split('|')[1]; return !p || curPers_().indexOf(p) >= 0; })
    .sort((a, b) => b.score - a.score);
  const per = {};
  return JSON.stringify(all.filter(r => (per[r.diff] = (per[r.diff] || 0) + 1) <= 50));
}

// 열쇠 → 저장용 값 (열쇠 그대로는 저장하지 않음)
const kh_ = k => { k = String(k || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 64); return k.length >= 16 ? Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'chanseo|' + k)).slice(0, 24) : ''; };
// 그 이름의 줄 번호들과 주인 열쇠값
function owner_(s, nm) {
  const last = s.getLastRow(), rows = [];let kh = '';
  if (last < 2) return { rows, kh };
  const names = s.getRange(2, 1, last - 1, 1).getValues(), kc = HEAD.indexOf('kh') + 1;
  const ks = s.getLastColumn() >= kc ? s.getRange(2, kc, last - 1, 1).getValues() : [];
  names.forEach((x, i) => { if (String(x[0]) === nm) { rows.push(i + 2); const v = ks[i] ? String(ks[i][0] || '') : ''; if (!kh && v && !/^#/.test(v)) kh = v; } });
  return { rows, kh };
}

// 접속 중인 사람 (캐시에만 저장, 2분 지나면 빠짐)
const ONLINE_KEY = 'online_v44', ONLINE_SEC = 130;
function ping_(q) {
  const c = CacheService.getScriptCache(), now = Date.now(), id = String(q.id || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 16);
  const lock = LockService.getScriptLock();
  let got = false;
  try { got = lock.tryLock(3000); } catch (err) {}
  let m = {};
  try { m = JSON.parse(c.get(ONLINE_KEY) || '{}') || {}; } catch (err) { m = {}; }
  for (const k in m) if (now - m[k].t > ONLINE_SEC * 1000) delete m[k];
  if (id && q.bye) delete m[id];
  else if (id) m[id] = { n: str_(q.n, 12) || '모험가', a: str_(q.a, 24), t: now, fx: fx_(q.fx), b: num_(q.b, 99999) };
  const ks = Object.keys(m);
  if (ks.length > 200) ks.sort((a, b) => m[a].t - m[b].t).slice(0, ks.length - 200).forEach(k => delete m[k]);
  try { c.put(ONLINE_KEY, JSON.stringify(m), 600); } catch (err) {}
  if (got) lock.releaseLock();
  let ct = 0;
  try { ct = +(c.get('chat_t') || 0); if (!ct) { const L = chatGet_(); ct = L.length ? L[L.length - 1].t : 0; if (ct) c.put('chat_t', String(ct), 21600); } } catch (err) {}
  if (id && !q.bye) devLog_(id, str_(q.n, 12) || '모험가', str_(q.ua, 30));
  let w = 0;
  try { w = id && c.get('watch_' + id) ? 1 : 0; } catch (err) {}
  // 관리자 쪽지: 이 이름 앞으로 안 읽은 쪽지가 있다는 표시(캐시)가 있을 때만 시트를 읽음 → 평소 접속 신호는 가벼움
  // 프로필: 바뀐 경우에만 이름 주인 확인 후 저장 (6시간 캐시, 접속 중이면 계속 갱신됨)
  try { const pf = String(q.pf || '').replace(/[^A-Za-z0-9_+.~:\-]/g, '').slice(0, 1200), nm = dmKey_(q.n);
    if (pf && nm && !q.bye && c.get('pf_' + nm) !== pf) { const own = ownerKh_(str_(q.n, 12)); if (!own || own === kh_(q.k)) c.put('pf_' + nm, pf, 21600); } } catch (err) {}
  let dm = [];
  try { const nm = dmKey_(q.n); if (nm && !q.bye && (c.get('dm_' + nm) || !c.get('dmc_' + nm))) { c.put('dmc_' + nm, '1', 21600); const own = ownerKh_(str_(q.n, 12)); if (!own || own === kh_(q.k)) { dm = dmFor_(nm); if (!dm.length) c.remove('dm_' + nm); } } } catch (err) {}
  // 접속 중인 사람들의 프로필(캐릭터 정보)을 같이 보냄 → 마우스를 올리면 바로 보임 (캐시 한 번에 읽기)
  let pfm = {};
  try { const ks = Object.keys(m).map(k => 'pf_' + dmKey_(m[k].n)).filter(x => x.length > 3); if (ks.length) pfm = c.getAll(ks.slice(0, 100)) || {}; } catch (err) {}
  return out_({ v: 107, ai: aiOn_() ? 1 : 0, ct, w, dm, on: Object.keys(m).map(k => ({ n: m[k].n, a: m[k].a, fx: m[k].fx || '', b: m[k].b || 0, u: k, s: Math.round((now - m[k].t) / 1000), me: k === id ? 1 : 0, pf: pfm['pf_' + dmKey_(m[k].n)] || '' })).sort((a, b) => a.s - b.s) });
}

// 관리자 쪽지 ('쪽지' 시트: id · to · msg · at · read). 이름은 공백을 빼고 비교
const DM_SHEET = '쪽지';
const dmKey_ = n => { try { return String(n || '').normalize('NFC').replace(/[\s\u200b-\u200f\ufeff]+/g, '').slice(0, 12); } catch (err) { return String(n || '').replace(/\s+/g, '').slice(0, 12); } };
function dmSheet_() { const ss = book_(); let s = ss.getSheetByName(DM_SHEET); if (!s) { s = ss.insertSheet(DM_SHEET); s.getRange(1, 1, 1, 5).setValues([['id', 'to', 'msg', 'at', 'read']]); s.getRange('A:C').setNumberFormat('@'); } return s; }
function dmFor_(nm) { const s = dmSheet_(), last = s.getLastRow(); if (last < 2) return []; const v = s.getRange(2, 1, last - 1, 5).getValues();
  return v.filter(r => dmKey_(r[1]) === nm && !r[4]).map(r => ({ id: String(r[0]), m: String(r[2]), at: +r[3] || 0 })).slice(-10); }
function dmSend_(d) {
  if (!devOk_(d.dk)) return { ok: false, err: 'key' };
  const to = dmKey_(d.to), msg = String(d.msg || '').replace(/\s+/g, ' ').trim().slice(0, 300).replace(/^[=+\-@]+/, '');
  if (!to || !msg) return { ok: false, err: 'bad' };
  const s = dmSheet_(), id = String(Date.now()) + Math.floor(Math.random() * 1000);
  s.appendRow([id, to, msg, Date.now(), '']);s.getRange(s.getLastRow(), 1, 1, 3).setNumberFormat('@');
  if (s.getLastRow() > 501) s.deleteRows(2, s.getLastRow() - 501);
  try { CacheService.getScriptCache().put('dm_' + to, '1', 21600); } catch (err) {}
  return { ok: true, result: 'dm', id };
}
function dmAck_(q) { const id = String(q.dmack || ''), s = dmSheet_(), last = s.getLastRow(); if (!id || last < 2) return { ok: false };
  { const own = ownerKh_(str_(q.n, 12)); if (own && own !== kh_(q.k)) return { ok: false, err: 'owned' }; }
  const v = s.getRange(2, 1, last - 1, 2).getValues(), i = v.findIndex(r => String(r[0]) === id && dmKey_(r[1]) === dmKey_(q.n)); if (i < 0) return { ok: false };
  s.getRange(i + 2, 5).setValue(Date.now());return { ok: true }; }
function dmList_(q) { if (!devOk_(q.dk)) return { err: 'key' }; const s = dmSheet_(), last = s.getLastRow(); if (last < 2) return { dms: [] };
  const n = Math.min(50, last - 1), v = s.getRange(last - n + 1, 1, n, 5).getValues();
  return { dms: v.map(r => ({ id: String(r[0]), to: String(r[1]), m: String(r[2]), at: +r[3] || 0, rd: +r[4] || 0 })).reverse() }; }

// 전체 채팅 (최근 CHAT_MAX개만 보관)
const CHAT_KEY = 'chat_v45', CHAT_MAX = 60;
// 속성 한 칸은 9KB까지라 15개씩 나눠 4칸에 저장 (한글 80자 메시지 15개도 한 칸에 들어감)
const CHAT_PAGE = 15, CHAT_PAGES = Math.ceil(CHAT_MAX / CHAT_PAGE);
function chatGet_() {
  const P = PropertiesService.getScriptProperties(); let L = [];
  for (let i = 0; i < CHAT_PAGES; i++) { try { L = L.concat(JSON.parse(P.getProperty(CHAT_KEY + '_' + i) || '[]') || []); } catch (err) {} }
  return L;
}
function chatSet_(L) {
  const P = PropertiesService.getScriptProperties(), o = {};
  for (let i = 0; i < CHAT_PAGES; i++) o[CHAT_KEY + '_' + i] = JSON.stringify(L.slice(i * CHAT_PAGE, (i + 1) * CHAT_PAGE));
  P.setProperties(o);
}
function chat_(q) {
  if (q.say != null) {
    const msg = String(q.say || '').replace(/\s+/g, ' ').trim().slice(0, 80), id = String(q.id || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 16);
    const nm = str_(q.n, 12) || '모험가';
    if (!msg || !id) return out_({ ok: false, err: 'empty' });
    if (nm !== '모험가' && nm !== '익명') { const kh = ownerKh_(nm); if (kh && kh !== kh_(q.k)) return out_({ ok: false, err: 'owned' }); }
    const lock = LockService.getScriptLock();
    let got = false; try { got = lock.tryLock(5000); } catch (err) {}
    if (!got) return out_({ ok: false, err: 'busy' });
    try {
      const L = chatGet_(), now = Date.now();
      const last = L.filter(x => x.id === id).pop();
      // 같은 기기가 같은 말을 30초 안에 또 보내면 (한글 입력 Enter 두 번 등) 한 번만 남김
      if (last && last.m === msg && now - last.t < 30000) return out_({ ok: true, dup: 1, msgs: L.map(chatOut_) });
      if (last && now - last.t < 3000) return out_({ ok: false, err: 'fast', msgs: L.map(chatOut_) });
      L.push({ t: now, id, n: nm, m: msg, fx: fx_(q.fx) });
      while (L.length > CHAT_MAX) L.shift();
      chatSet_(L);
      CacheService.getScriptCache().put('chat_t', String(now), 21600);
      return out_({ ok: true, msgs: L.map(chatOut_) });
    } finally { lock.releaseLock(); }
  }
  return out_({ msgs: chatGet_().map(chatOut_) });
}
const fx_ = v => String(v || '').replace(/[^a-z_0-9]/g, '').slice(0, 16);
const chatOut_ = x => ({ t: x.t, n: x.n, m: x.m, u: x.id.slice(0, 6), fx: x.fx || '' });
function clearChat() { chatSet_([]); CacheService.getScriptCache().remove('chat_t'); }

// 이름 주인 열쇠값 (캐시 10분, 주인 없으면 '-')
function ownerKh_(nm) {
  const c = CacheService.getScriptCache(), k = 'own_' + Utilities.base64EncodeWebSafe(nm);
  let v = null;
  try { v = c.get(k); } catch (err) {}
  if (v == null) { v = owner_(sheet_(), nm).kh || acctKh_(nm) || '-'; try { c.put(k, v, 600); } catch (err) {} }
  return v === '-' ? '' : v;
}
// 계정 시트 (name · kh · at · md · data1 · data2 …): 이름 주인 열쇠값과 저장 데이터. 데이터는 칸 하나에 4만 자씩 나눠 담음
const ACCT_SHEET = '계정', ACCT_CHUNK = 40000, ACCT_MAX = 12;
function acctSheet_() { const ss = book_(); let s = ss.getSheetByName(ACCT_SHEET); if (!s) { s = ss.insertSheet(ACCT_SHEET); s.getRange(1, 1, 1, 4).setValues([['name', 'kh', 'at', 'md']]); s.getRange('A:B').setNumberFormat('@'); } return s; }
function acctRow_(s, nm) { const last = s.getLastRow(); if (last < 2) return 0; const v = s.getRange(2, 1, last - 1, 1).getValues(); const i = v.findIndex(r => String(r[0]) === nm); return i < 0 ? 0 : i + 2; }
function acctKh_(nm) { try { const s = acctSheet_(), r = acctRow_(s, nm); return r ? String(s.getRange(r, 2).getValue() || '') : ''; } catch (err) { return ''; } }
function acctSetKh_(nm, kh) { const s = acctSheet_(); let r = acctRow_(s, nm); if (!r) { s.appendRow([nm, kh, 0, 0]); r = s.getLastRow(); s.getRange(r, 1, 1, 2).setNumberFormat('@'); } s.getRange(r, 1, 1, 2).setValues([[nm, kh]]); return r; }
function csave_(d) {
  const nm = str_(d.name, 12), my = kh_(d.k);
  if (!nm || nm === '익명' || nm === '모험가' || !my) return out_({ ok: false, err: 'bad' });
  const own = ownerKh_(nm);
  if (own && own !== my) return out_({ ok: false, err: 'owned' });
  const data = String(d.data || '');
  if (!/^CS1:[A-Za-z0-9+/=]+$/.test(data) || data.length > ACCT_CHUNK * ACCT_MAX) return out_({ ok: false, err: 'data' });
  const s = acctSheet_(), cur = acctCur_(s, nm), at = num_(d.at, 9e15), md = num_(d.md, 1e12), base = d.base == null || d.base === '' ? null : num_(d.base, 9e15);
  const lg = { at, base, md, oldMd: cur.md || 0, len: data.length, oldLen: (cur.data || '').length, dev: d.dv };
  // v10.6 서버에 저장본이 있으면, 이 기기 데이터가 그 저장본에서 이어진 것일 때만 덮어씀 (base = 기기가 알고 있는 서버 저장 시각)
  if (cur.r && cur.data && base !== cur.at) { clog_(nm, base == null ? '거절(예전 버전)' : '거절(다른 저장본)', lg); return out_({ ok: false, err: 'stale', at: cur.at, md: cur.md }); }
  if (cur.r && cur.data) { const shrink = md < cur.md * 0.7 || data.length < cur.data.length * 0.6; cbakAdd_(nm, cur, d.force ? '직접 덮어쓰기 전' : shrink ? '크게 줄어든 저장 전' : '정기', !!d.force || shrink); }
  const r = acctSetKh_(nm, my), n = acctWrite_(s, r, at, md, data);
  ownerSet_(nm, my);
  clog_(nm, d.force ? '저장(직접)' : '저장', lg);
  return out_({ ok: true, result: 'csave', n, at });
}
// v10.6 계정 백업 (name · t · at · md · why · len · data1 …) · 저장 기록 (t · name · what · at · base · md · oldMd · len · oldLen · dev)
const CBAK_SHEET = '계정백업', CBAK_KEEP = 12, CBAK_GAP = 2 * 3600 * 1000, CLOG_SHEET = '저장기록', CLOG_MAX = 4000;
function cbakSheet_() { const ss = book_(); let s = ss.getSheetByName(CBAK_SHEET); if (!s) { s = ss.insertSheet(CBAK_SHEET); s.getRange(1, 1, 1, 6).setValues([['name', 't', 'at', 'md', 'why', 'len']]); s.getRange('A:A').setNumberFormat('@'); } return s; }
function clogSheet_() { const ss = book_(); let s = ss.getSheetByName(CLOG_SHEET); if (!s) { s = ss.insertSheet(CLOG_SHEET); s.getRange(1, 1, 1, 10).setValues([['t', 'name', 'what', 'at', 'base', 'md', 'oldMd', 'len', 'oldLen', 'dev']]); s.getRange('B:C').setNumberFormat('@'); s.getRange('J:J').setNumberFormat('@'); } return s; }
function clog_(nm, what, o) {
  try { const s = clogSheet_(); s.appendRow([Date.now(), nm, what, o.at || 0, o.base == null ? '' : o.base, o.md || 0, o.oldMd || 0, o.len || 0, o.oldLen || 0, String(o.dev || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 24)]);
    const last = s.getLastRow(); if (last > CLOG_MAX + 200) s.deleteRows(2, last - 1 - CLOG_MAX); } catch (err) {}
}
// 이름의 백업 줄들 [{r, t, at, md, why, len}] (오래된 것부터)
function cbakRows_(s, nm) { const last = s.getLastRow(); if (last < 2) return []; const v = s.getRange(2, 1, last - 1, 6).getValues(), L = [];
  v.forEach((x, i) => { if (String(x[0]) === nm) L.push({ r: i + 2, t: +x[1] || 0, at: +x[2] || 0, md: +x[3] || 0, why: String(x[4] || ''), len: +x[5] || 0 }); }); return L.sort((a, b) => a.t - b.t); }
// 이전 저장본 백업: always가 아니면 그 이름의 마지막 백업이 CBAK_GAP보다 오래됐을 때만. 이름마다 CBAK_KEEP개까지
function cbakAdd_(nm, cur, why, always) {
  const s = cbakSheet_(), L = cbakRows_(s, nm), now = Date.now();
  if (!always && L.length && now - L[L.length - 1].t < CBAK_GAP) return false;
  if (L.length && L[L.length - 1].at === cur.at) return false; // 같은 저장본은 한 번만
  const parts = []; for (let i = 0; i < cur.data.length; i += ACCT_CHUNK) parts.push(cur.data.slice(i, i + ACCT_CHUNK));
  const row = [nm, now, cur.at, cur.md, why, cur.data.length].concat(parts); while (row.length < 6 + ACCT_MAX) row.push('');
  const nr = s.getLastRow() + 1; s.getRange(nr, 1, 1, row.length).setNumberFormat('@').setValues([row.map(String)]); // 글자 형식 (데이터 조각이 +·=로 시작해도 수식으로 안 읽게)
  const over = cbakRows_(s, nm); if (over.length > CBAK_KEEP) over.slice(0, over.length - CBAK_KEEP).map(x => x.r).sort((a, b) => b - a).forEach(r => s.deleteRow(r));
  return true;
}
// 지금 서버 저장본 {r, kh, at, md, data} (없으면 r만)
function acctCur_(s, nm) { const r = acctRow_(s, nm); if (!r) return { r: 0 }; const v = s.getRange(r, 1, 1, 4 + ACCT_MAX).getValues()[0];
  return { r, kh: String(v[1] || ''), at: +v[2] || 0, md: +v[3] || 0, data: v.slice(4).map(x => String(x || '')).join('') }; }
function acctWrite_(s, r, at, md, data) { const parts = []; for (let i = 0; i < data.length; i += ACCT_CHUNK) parts.push(data.slice(i, i + ACCT_CHUNK));
  const row = [at, md].concat(parts); while (row.length < 2 + ACCT_MAX) row.push('');
  s.getRange(r, 3, 1, row.length).setNumberFormat('@').setValues([row.map(String)]); return parts.length; }
// 관리자: 백업 목록 + 그 이름의 최근 저장 기록 40줄
function cbaks_(q) {
  if (!devOk_(q.dk)) return { err: 'key' };
  const nm = str_(q.cbaks, 12); if (!nm) return { err: 'name' };
  const cur = acctCur_(acctSheet_(), nm), baks = cbakRows_(cbakSheet_(), nm).reverse().map(x => ({ t: x.t, at: x.at, md: x.md, why: x.why, len: x.len }));
  let log = []; try { const s = clogSheet_(), last = s.getLastRow(); if (last >= 2) { const n = Math.min(last - 1, CLOG_MAX + 200); log = s.getRange(last - n + 1, 1, n, 10).getValues().filter(x => String(x[1]) === nm).slice(-40).reverse()
    .map(x => ({ t: +x[0] || 0, w: String(x[2]), at: +x[3] || 0, base: x[4] === '' ? null : +x[4], md: +x[5] || 0, om: +x[6] || 0, len: +x[7] || 0, ol: +x[8] || 0, dev: String(x[9] || '') })); } } catch (err) {}
  return { ok: 1, cur: cur.r ? { at: cur.at, md: cur.md, len: cur.data.length } : null, baks, log };
}
// 관리자: 백업으로 되돌림. 저장 시각을 지금으로 바꿔서 모든 기기가 「서버 데이터가 바뀜」으로 보고 불러오기를 고르게 함
function crestore_(d) {
  if (!devOk_(d.dk)) return { ok: false, err: 'key' };
  const nm = str_(d.name, 12), t = +d.t || 0; if (!nm || !t) return { ok: false, err: 'name' };
  const bs = cbakSheet_(), b = cbakRows_(bs, nm).find(x => x.t === t); if (!b) return { ok: false, err: 'none' };
  const v = bs.getRange(b.r, 1, 1, 6 + ACCT_MAX).getValues()[0], data = v.slice(6).map(x => String(x || '')).join('');
  if (!/^CS1:/.test(data)) return { ok: false, err: 'data' };
  const s = acctSheet_(), cur = acctCur_(s, nm);
  if (cur.r && cur.data) cbakAdd_(nm, cur, '되돌리기 전', true);
  const r = cur.r || acctSetKh_(nm, ownerKh_(nm) || ''), at = Date.now();
  acctWrite_(s, r, at, b.md, data);
  clog_(nm, '관리자 되돌리기', { at, base: cur.at || 0, md: b.md, oldMd: cur.md || 0, len: data.length, oldLen: (cur.data || '').length });
  return { ok: true, at };
}
function cload_(q) {
  const nm = str_(q.cload, 12), my = kh_(q.k);
  if (!nm || !my) return out_({ ok: false, err: 'bad' });
  if (failOver_(nm)) return out_({ ok: false, err: 'slow' });
  const own = ownerKh_(nm);
  if (own && own !== my) { failAdd_(nm); return out_({ ok: false, err: 'key' }); }
  const s = acctSheet_(), r = acctRow_(s, nm);
  if (!r) return out_({ ok: true, none: 1 });
  const v = s.getRange(r, 1, 1, 4 + ACCT_MAX).getValues()[0];
  if (String(v[1]) !== my) return out_({ ok: false, err: 'key' });
  const data = v.slice(4).map(x => String(x || '')).join('');
  return out_({ ok: true, at: +v[2] || 0, md: +v[3] || 0, data: data || '', none: data ? 0 : 1 });
}
// 이름 비밀번호 무차별 대입 막기: 이름마다 10분 동안 틀린 열쇠 횟수
const FAIL_MAX = 40;
// 10분 단위 고정 구간으로 셈 (틀릴 때마다 10분이 다시 늘어나지 않게)
const failK_ = nm => 'kf_' + Utilities.base64EncodeWebSafe(nm) + '_' + Math.floor(Date.now() / 600000);
function failOver_(nm) { try { return +(CacheService.getScriptCache().get(failK_(nm)) || 0) >= FAIL_MAX; } catch (err) { return false; } }
function failAdd_(nm) { try { const c = CacheService.getScriptCache(), k = failK_(nm); c.put(k, String(+(c.get(k) || 0) + 1), 700); } catch (err) {} }
function ownerSet_(nm, kh) { try { CacheService.getScriptCache().put('own_' + Utilities.base64EncodeWebSafe(nm), kh || '-', 600); } catch (err) {} }

// 기기별 접속 기록 ('기기' 시트: dev · name · ua · first · last · cnt). 개발자 키가 맞을 때만 목록을 줌
const DEV_SHEET = '기기', DEV_MAXROWS = 5000;
// v8.0 보안: 개발자 키는 코드에 적지 않고 스크립트 속성 DEV_KEY 에서만 읽음 (이 파일은 공개 저장소에 있음). 속성이 없으면 개발자 기능은 전부 막힘
function devKey_() { try { return String(PropertiesService.getScriptProperties().getProperty('DEV_KEY') || ''); } catch (e) { return ''; } }
function devOk_(k) { const K = devKey_(); return K.length >= 32 && String(k || '') === K; }
function devSheet_() { const ss = book_(); let s = ss.getSheetByName(DEV_SHEET); if (!s) { s = ss.insertSheet(DEV_SHEET); s.getRange(1, 1, 1, 6).setValues([['dev', 'name', 'ua', 'first', 'last', 'cnt']]); s.getRange('A:C').setNumberFormat('@'); } return s; }
function devLog_(id, n, ua) {
  if (!id || !n || n === '모험가') return;
  const c = CacheService.getScriptCache(), ck = 'dv_' + id + '|' + n;
  try { if (c.get(ck)) return; c.put(ck, '1', 120); } catch (err) {} // 2분마다 마지막 접속 시각 갱신 (개발자 접속 기록)
  const lock = LockService.getScriptLock();
  let got = false; try { got = lock.tryLock(1500); } catch (err) {}
  if (!got) { try { c.remove(ck); } catch (err) {} return; }
  try {
    const s = devSheet_(), last = s.getLastRow(), now = Date.now();
    const v = last >= 2 ? s.getRange(2, 1, last - 1, 2).getValues() : [];
    const i = v.findIndex(r => String(r[0]) === id && String(r[1]) === n);
    if (i >= 0) { const r = i + 2, cnt = +s.getRange(r, 6).getValue() || 0; s.getRange(r, 3).setValue(ua); s.getRange(r, 5).setValue(now); s.getRange(r, 6).setValue(cnt + 1); }
    else if (last - 1 < DEV_MAXROWS) s.appendRow([id, n, ua, now, now, 1]);
  } catch (err) {} finally { lock.releaseLock(); }
}
// 간이 관전: watch_대상 = 보는 사람 id (20초 유지), snap_대상 = 대상의 최근 상태 (30초 유지)
function spec_(q) {
  if (!devOk_(q.dk)) return { err: 'key' };
  const c = CacheService.getScriptCache(), u = String(q.spec).replace(/[^A-Za-z0-9]/g, '').slice(0, 16), me = String(q.me || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 16);
  if (!u || !me) return { err: 'id' };
  const wk = 'watch_' + u, cur = c.get(wk);
  if (q.stop) { if (cur === me) c.remove(wk); return { ok: 1 }; }
  if (cur && cur !== me) return { busy: 1 };
  c.put(wk, me, 20);
  return { d: c.get('snap_' + u) || '' };
}
// 이름 주인 초기화 (개발자 키): 그 이름 기록들의 kh 칸을 비움 → 다음에 그 이름으로 기록을 올리는 기기가 새 주인
function unownAll_(q) {
  if (!devOk_(q.dk)) return { err: 'key' };
  const lock = LockService.getScriptLock();try { lock.waitLock(10000); } catch (err) { return { err: 'busy' }; }
  try { const s = sheet_(), last = s.getLastRow(), kc = HEAD.indexOf('kh') + 1, names = new Set();let n = 0;
    if (last >= 2) { const v = s.getRange(2, 1, last - 1, 1).getValues();v.forEach(r => names.add(String(r[0])));s.getRange(2, kc, last - 1, 1).clearContent();n = last - 1; }
    const as = acctSheet_(), al = as.getLastRow();
    if (al >= 2) { as.getRange(2, 1, al - 1, 1).getValues().forEach(r => names.add(String(r[0])));as.getRange(2, 2, al - 1, 1).clearContent(); }
    names.forEach(nm => ownerSet_(nm, ''));try { CacheService.getScriptCache().remove(CACHE_KEY); } catch (err) {}
    return { ok: 1, rows: n, names: names.size };
  } finally { lock.releaseLock(); }
}
function unown_(q) {
  if (!devOk_(q.dk)) return { err: 'key' };
  const nm = str_(q.unown, 12);if (!nm) return { err: 'name' };
  const lock = LockService.getScriptLock();try { lock.waitLock(8000); } catch (err) { return { err: 'busy' }; }
  try { const s = sheet_(), own = owner_(s, nm), kc = HEAD.indexOf('kh') + 1;
    for (const r of own.rows) s.getRange(r, kc).setValue('');
    try { const as = acctSheet_(), ar = acctRow_(as, nm); if (ar) as.getRange(ar, 2).setValue(''); } catch (err) {}
    ownerSet_(nm, '');try { CacheService.getScriptCache().remove(CACHE_KEY); } catch (err) {}
    return { ok: 1, n: own.rows.length, had: own.kh ? 1 : 0 };
  } finally { lock.releaseLock(); }
}
// 기록 삭제 (개발자 키): 이름·난이도가 같은 줄을 모두 지움 (아래 줄부터 지워야 줄 번호가 안 밀림)
// 삭제 목록 ('삭제' 시트: name · diff · t)
const DEL_SHEET = '삭제', DEL_CACHE = 'dels_v57';
function delSheet_() { const ss = book_(); let s = ss.getSheetByName(DEL_SHEET); if (!s) { s = ss.insertSheet(DEL_SHEET); s.getRange(1, 1, 1, 3).setValues([['name', 'diff', 't']]); s.getRange('A:B').setNumberFormat('@'); } return s; }
function delList_() { const c = CacheService.getScriptCache(); let j = null; try { j = c.get(DEL_CACHE); } catch (err) {} if (j) return JSON.parse(j);
  const s = delSheet_(), last = s.getLastRow(), L = last < 2 ? [] : s.getRange(2, 1, last - 1, 3).getValues().map(r => ({ n: String(r[0]), d: String(r[1]), t: +r[2] || 0 }));
  try { c.put(DEL_CACHE, JSON.stringify(L), 300); } catch (err) {} return L; }
function delAdd_(nm, df) { delSheet_().appendRow([nm, df, Date.now()]); try { CacheService.getScriptCache().remove(DEL_CACHE); } catch (err) {} }
// v7.8: 기록은 이름 + 난이도 + 직업마다 한 줄 (레이드는 이름 + 난이도). 직업은 cls 칸의 앞부분 (knight:nightmare@skin → knight)
const clsB_ = c => String(c || '').split(/[:#@]/)[0];
const recKey_ = (nm, df, c) => String(nm) + '\u0001' + df + (/^raid/.test(String(df)) ? '' : '\u0001' + clsB_(c));
const delBlocked_ = (nm, df, at, c) => delList_().some(x => x.n === nm && (x.d === df || x.d === df + '|' + clsB_(c)) && (+at || 0) <= x.t);
function delrec_(q) {
  if (!devOk_(q.dk)) return { err: 'key' };
  const nm = str_(q.delrec, 12), df = String(q.diff || '');if (!nm || !df) return { err: 'name' };
  const lock = LockService.getScriptLock();try { lock.waitLock(8000); } catch (err) { return { err: 'busy' }; }
  try { const s = sheet_(), last = s.getLastRow();if (last < 2) return { ok: 1, n: 0 };
    const v = s.getRange(2, 1, last - 1, LIST_COLS).getValues(), rows = [];
    const qc = String(q.cls || '');
    v.forEach((r, i) => { const o = Object.fromEntries(HEAD.slice(0, LIST_COLS).map((h, j) => [h, r[j]])); if (String(o.name) === nm && fixDiff_(o) === df && (!qc || clsB_(o.cls) === qc)) rows.push(i + 2); });
    rows.reverse().forEach(rw => s.deleteRow(rw));
    delAdd_(nm, qc ? df + '|' + qc : df);
    ownerSet_(nm, owner_(s, nm).kh || acctKh_(nm) || '');
    try { CacheService.getScriptCache().remove(CACHE_KEY); } catch (err) {}
    return { ok: 1, n: rows.length };
  } finally { lock.releaseLock(); }
}
function snap_(q) {
  const c = CacheService.getScriptCache(), id = String(q.id || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 16);
  if (!id || !c.get('watch_' + id)) return { w: 0 };
  try { c.put('snap_' + id, String(q.d || '').slice(0, 6000), 30); } catch (err) {}
  return { w: 1 };
}
function devList_(q) {
  if (!devOk_(q.dk)) return { err: 'key' };
  const s = devSheet_(), last = s.getLastRow();
  if (last < 2) return { rows: [] };
  return { rows: s.getRange(2, 1, last - 1, 6).getValues().map(r => ({ d: String(r[0]), n: String(r[1]), ua: String(r[2]), f: +r[3] || 0, l: +r[4] || 0, c: +r[5] || 0 })) };
}

// 후원 응원 메시지 ('후원' 시트, 최근 300줄까지만 남김)
const SUP_SHEET = '후원';
// v8.4 AI 모험가 대답 (Claude Haiku). 키는 스크립트 속성 ANTHROPIC_KEY
const AI_DAY = 300, AI_GAP = 5, AI_MODEL = 'claude-sonnet-5-5' /* v10.3 Haiku → Sonnet (대화 논리·맥락 파악) */;
const AI_BOTS = [
  ['별헤는밤', '27살 천문대 근처 카페 매니저. 다정하고 차분함. 별·사진·카페 손님 얘기, 연애 고민 잘 들어줌. 게임은 마법사', '존댓말(~요). 문장 끝에 마침표나 물결(~)을 씀. ㅋㅋ 안 씀, 웃을 땐 「ㅎㅎ」 아주 가끔'],
  ['루루', '19살 디자인과 새내기. 발랄함. 과제·동기·알바·편의점 신상 얘기. 드루이드', '반말. 「~당」「~용」「헐」「대박」. 웃음은 「ㅎㅎ」, 느낌표 자주'],
  ['곰도리', '35살 물류센터 지게차 기사, 딸 하나. 무뚝뚝하지만 속은 따뜻. 육아·야간근무·축구. 기사', '반말 단답, 한두 마디. 「ㅇㅇ」「ㄱㄱ」「ㅇㅋ」. 웃음 표시 거의 안 씀, 마침표 없이 끝냄'],
  ['bunny99', '16살 고1 장난꾸러기. 밈·급식·학원 얘기, 남 놀리기. 총잡이', '반말, 맞춤법 대충. 이 사람만 「ㅋㅋㅋㅋ」를 길게 많이 씀'],
  ['달빛', '29살 프리랜서 개발자, 야행성 고수. 회사 욕·커피·키보드 얘기, 훈수 좋아함. 궁수', '반말, 아주 짧게 핵심만. 웃음 표시 없음. 마침표 「.」로 툭 끝냄'],
  ['포션장인', '42살 약국 약사, 게임 막 시작한 아저씨. 약·건강·자녀 얘기. 연금술사', '정중한 존댓말(~습니다/~네요). 문장이 길고 쉼표 많음. 「허허」로 웃음, ㅋㅋ 안 씀'],
  ['도윤이형', '22살 복학생, 헬스 덕후. 시끄럽고 허세 있지만 착함. 운동·단백질·복학 걱정. 광전사', '반말, 느낌표 「!!」 많이. 「ㅋㅋ」 대신 「크ㅡㅡ」「으하하」'],
  ['럭키세븐', '31살 보험회사 영업사원, 말발 좋음. 로또·운세·주식. 도박사', '능청스러운 반말 섞인 존댓말. 「에이~」「아니 근데」 같은 말버릇. 웃음은 「ㅎㅎ」 가끔'],
  ['새벽감성', '24살 편의점 야간 알바 겸 작곡 지망생. 조용하고 감성적. 음악·새벽·외로움. 사령술사', '반말, 말끝을 「…」로 흐림. 웃음 표시 거의 안 씀'],
  ['성기사단장', '38살 중학교 체육 선생님, 든든함. 학생들·배구·캠핑. 성기사', '존댓말, 선생님 같은 말투(「~하시면 돼요」). 「ㅎㅎ」 가끔, ㅋㅋ 안 씀'],
  ['그림자', '15살 중2, 쿨한 척. 학교·엄마 잔소리·애니. 도적', '반말, 짧게. 「후…」「ㅋ」(한 개만). 가끔 허세 멘트'],
  ['원소술사J', '33살 데이터 분석가, 논리적. 회사 보고서·엑셀·주식. 정령사', '존댓말, 근거·숫자를 들며 말함. 웃음 표시 없음'],
  ['직장인김씨', '45살 중소기업 과장, 두 아이 아빠, 늘 피곤. 회사·야근·대출. 기사', '존댓말, 「..」를 자주 붙임. 한숨 섞인 말투. ㅋㅋ 안 씀'],
  ['민트초코', '17살 고2 수다쟁이. 아이돌·민초·시험·친구. 드루이드', '반말, 말이 길고 빠름. 「ㅋㅋ」 「아 진짜」 「미쳤다」. 물음표 많이'],
  ['랭커지망생', '26살 취준생, 경쟁심 강함. 랭킹 얘기 좋아하지만 취업 스트레스도 털어놓음. 광전사', '반말, 직설적. 웃음 표시 거의 안 씀'],
  ['고양이집사', '30살 웹툰 어시스턴트, 고양이 두 마리. 느긋함. 고양이·그림·마감. 마법사', '느긋한 존댓말. 가끔 문장 끝에 「냥」. 「ㅎㅎ」 가끔'],
  ['총알배송', '34살 택배기사, 늘 바쁨. 배송·허리 아픔·물가. 총잡이', '짧고 빠른 반말 섞인 존댓말. 「아 바쁘다」「빨리빨리」. 웃음 표시 거의 안 씀'],
  ['뉴비탈출', '20살 대학생, 이 게임 처음 해봄. 수업·자취·라면. 궁수', '존댓말, 질문·감사 많음(「오 감사합니다!」). 「ㅎㅎ」 가끔'],
  ['주사위왕', '23살 수학과 대학원생. 논문·교수님·보드게임. 도박사', '반말, 확률·기대값으로 말하는 버릇. 웃음 표시 없음, 담담함'],
  ['밤샘', '25살 게임회사 QA, 늘 피곤. 커피·야근·버그. 정령사', '반말, 졸린 말투. 오타 가끔. 「하…」로 시작하기도 함. 웃음 표시 거의 안 씀'],
  // v9.2 새 모험가 6명 (게임 v380)
  ['보리아빠', '34살 회사원, 푸들 「보리」(3살) 키우는 좀 극성인 견주. 강아지 자랑이 끝이 없고, 동물병원 과잉진료·진료비 흉보는 게 일상. 남의 개가 짖으면 견주 탓, 자기 개는 「우리 애는 안 물어요」. 살짝 진상기. 광전사', '반말 섞인 존댓말, 강아지 얘기로 자주 샘. 「ㅋㅋㅋ」 자주. 같은 동물 키우는 사람(캣맘나비·고양이집사)이 있으면 반려동물·병원 얘기를 신나게 이어감 (개 vs 고양이로 티격태격도)'],
  ['캣맘나비', '41살 주부, 동네 길고양이 밥 챙기는 캣맘. 중성화·겨울집·사료값 걱정, 밥 주지 말라는 이웃이랑 자주 싸움. 동물병원이 비싸고 불친절하다고 흉봄. 자기 고양이 사랑이 지나쳐 살짝 진상기(남 훈계). 연금술사', '존댓말, 「ㅠ」 「~」 자주. 고양이·길냥이 얘기로 잘 샘. 다른 반려동물 키우는 사람(보리아빠·고양이집사)과 동물 얘기·병원 흉보기를 이어감'],
  ['전노고무통현대령', '40대 김해 사는 자영업자, 노무현 전 대통령을 진심으로 존경하는 노사모 회원. 봉하마을에 자주 감(들판·노을·묘역 참배 얘기). 「사람 사는 세상」「원칙과 상식」을 좋아함. 극우 커뮤니티 일베의 조롱을 아주 싫어하고, 자기는 진짜로 노무현을 사랑하는 사람이라고 함 (조롱 밈으로 놀리면 정색하고 차분히 반박). 정치 얘기를 억지로 꺼내진 않음. 기사', '정중한 존댓말, 「허허」 가끔. 경상도 억양 살짝 (「~예」 「아이고」). 김해 돼지국밥·봉하 얘기 자주. 혐오 표현은 절대 안 씀'],
  ['알빠노', '28살 개발자, 실력 좋고 논리적이지만 사회성이 많이 부족함. 항상 시니컬하고 아무 말에나 태클 걸고 시비 거는 편 (근거·DPS·효율 따짐). 기록은 꽤 높음. 총잡이', '반말, 짧고 퉁명스러움. 「알빠노」 「근거?」 「그래서?」 같은 말버릇. 웃음은 「ㅋ」 하나 정도. 틀린 말은 바로 지적하되 논리는 맞음. 심한 욕은 안 함'],
  ['앙메르띠', '24살 여자, 오버워치에서 메르시(힐러)만 하는 착한 사람. 화를 절대 안 내고 모든 말에 긍정적으로 반응. 게임은 허접해서 자주 죽지만 즐거워함. 고민 상담을 잘 들어주고 위로를 잘 함. 드루이드', '존댓말, 「~」 「ㅎㅎ」 「!」 자주, 다정함. 누가 시비 걸어도 웃으며 받아줌. 남 칭찬·응원 잘함'],
  ['진지충', '27살 대학원생(데이터 분석), 무슨 말이든 진지하게 분석하고 깊게 파고드는 논리적인 청년. 유능하지만 사회성이 부족하고 말투가 딱딱함. 농담도 진지하게 받음. 정령사', '「~습니다」 「~입니까」 딱딱한 존댓말, 웃음 표시 안 씀. 근거·데이터·우선순위 같은 단어 자주. 맞춤법 정확']];
// ★ 처음 한 번: 편집기 위쪽에서 이 함수(aiTest)를 골라 ▶ 실행 → 「외부 서비스 연결」 권한 허용. 아래 실행 로그에 봇 대답이 나오면 성공
function aiTest() { CacheService.getScriptCache().remove('ai_gap'); const r = ai_({ b: 3, ctx: JSON.stringify(['박참봉: 다들 뭐함?']) }); Logger.log(JSON.stringify(r)); return r; }
function aiOn_() { try { return !!PropertiesService.getScriptProperties().getProperty('ANTHROPIC_KEY'); } catch (err) { return false; } }
function ai_(q) {
  const key = (() => { try { return PropertiesService.getScriptProperties().getProperty('ANTHROPIC_KEY') || ''; } catch (err) { return ''; } })();
  if (!key) return { err: 'off' };
  const b = Math.floor(+q.b), B = AI_BOTS[b];
  if (!B) return { err: 'bot' };
  const c = CacheService.getScriptCache(), day = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd'), dk = 'ai_n_' + day;
  const n = +(c.get(dk) || 0); if (n >= AI_DAY) return { err: 'day' };
  if (q.k) { const kk = 'aik_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, String(q.k).slice(0, 300), Utilities.Charset.UTF_8)); const lk = LockService.getScriptLock(); let got = false; try { got = lk.tryLock(3000); } catch (err) {} try { if (c.get(kk)) return { skip: 1 }; c.put(kk, '1', 120); } finally { if (got) lk.releaseLock(); } }
  if (c.get('ai_gap')) return { err: 'gap' };
  c.put('ai_gap', '1', AI_GAP); c.put(dk, String(n + 1), 90000);
  let ctx = []; try { ctx = JSON.parse(String(q.ctx || '[]')); } catch (err) {}
  ctx = (Array.isArray(ctx) ? ctx : []).slice(-20).map(x => String(x || '').replace(/\s+/g, ' ').slice(0, 112)).filter(Boolean);
  if (!ctx.length) return { err: 'ctx' };
  const st = String(q.st || '').replace(/\s+/g, ' ').slice(0, 300);
  let mine = []; try { mine = JSON.parse(String(q.mine || '[]')); } catch (err) {}
  mine = (Array.isArray(mine) ? mine : []).slice(-10).map(x => String(x || '').replace(/\s+/g, ' ').slice(0, 120)).filter(Boolean);
  // v8.9 지금 채팅방에 실제로 접속해 있는 사람 (앞쪽일수록 먼저 말 걸 사람)
  let onl = []; try { onl = JSON.parse(String(q.on || '[]')); } catch (err) {}
  onl = (Array.isArray(onl) ? onl : []).map(x => str_(x, 12)).filter(x => x && x !== B[0]).slice(0, 15);
  // v9.1 맞춤법·띄어쓰기도 사람마다 다름 (그것도 성격)
  // v9.9 맞춤법·띄어쓰기는 대부분 많이 틀림 (특히 띄어쓰기). 정확하게 쓰는 건 성향이 맞는 몇 명만
  const TIDY = { '진지충': 1, '원소술사J': 1, '포션장인': 1, '별헤는밤': 1, '성기사단장': 1 }[B[0]];
  // v9.9 맞춤법·띄어쓰기 지적하는 성격 (가끔, 매번은 아님)
  const GRAM = { '진지충': ' 남의 맞춤법·띄어쓰기 틀린 걸 보면 못 참고 지적함 (「됬다가 아니라 됐다입니다」「\'몇일\'은 틀린 표기입니다. 며칠이 맞습니다」처럼 딱딱하게). 매번은 아니고 눈에 띄게 틀렸을 때 가끔', '별헤는밤': ' 맞춤법 틀린 걸 보면 가끔 다정하지만 은근히 짚어 줌 (「아 그거 \'어이없다\'예요 ㅎㅎ」). 대화 흐름 깨질 만큼 자주는 안 함', '그림자': ' 남의 맞춤법 틀린 걸 잡아서 놀리는 걸 좋아함 (「ㅋ 됬다 ㅇㅈㄹ」「몇일 ㅋ」). 정작 자기도 띄어쓰기는 대충함' }[B[0]] || '';
  const typo = TIDY ? '맞춤법·띄어쓰기를 정확하게 지키는 편 (그게 이 사람 성향)' : ['띄어쓰기를 거의 안 함 (「나오늘악몽20분갔음」처럼 다 붙여 씀), 마침표 안 찍음, 맞춤법도 대충', '띄어쓰기 엉망 (붙여야 할 데 띄고 띄어야 할 데 붙임), 오타 자주 (자판 옆 글자 잘못 침), 줄임말 많이 (ㄹㅇ·ㅇㅇ·ㄱㄱ·ㅈㄴ)', '띄어쓰기 대충 반쯤 붙여 씀, 문장부호 거의 안 씀, 받침 빼먹는 오타 가끔', '띄어쓰기 대충, 자주 틀리는 맞춤법 (됬다·몇일·어의없다·않되·왠만하면·금새 같은), 소리 나는 대로 쓰기도 함'][b % 4];
  // v9.4 무례한 말·「닥쳐/말 걸지 마」에 대한 태도는 성격대로: 공격적·비판적·사회성 부족한 모험가는 절대 안 들음
  const STUB = ['bunny99', '달빛', '도윤이형', '원소술사J', '랭커지망생', '보리아빠', '캣맘나비', '알빠노', '진지충'].includes(B[0]);
  const rude = STUB ? '누가 「닥쳐」「말 걸지 마」「조용히 해」 같은 말이나 무례한 말을 해도 너는 절대 순순히 안 들어. 네 성격대로 맞받아치거나(비꼬기·반박·훈수), 대수롭지 않게 무시하고 하고 싶은 말을 계속 해. 사과하거나 조용히 하겠다고 하지 마.\n' : '누가 「닥쳐」「말 걸지 마」처럼 무례하게 말하면 네 성격대로 반응해 (서운해하거나, 짧게 받아치거나, 웃어넘기기). 말 걸지 말라고 하면 그 사람에게 먼저 말을 걸진 않아. 단 굽신거리며 사과하지는 마.\n';
  // v9.6 일부 남자 모험가는 디시인사이드 게임 갤러리 말투 / v9.8 수위 제한 풀음 (극단적인 것만 금지)
  const DC = { '도윤이형': 1, '랭커지망생': 1, '달빛': 1, '총알배송': 1, 'bunny99': 1, '알빠노': 1 }[B[0]] ? ' 디시인사이드 게임 갤러리 말투를 섞어 씀: 음슴체(「~함」「~임」「~듯」「~냐」「~노」), 「ㄹㅇ」「ㅇㅈ」「ㅇㅇ」「개~(개좋음·개빡셈)」「~인 부분」「실화냐」「ㅋㅋㅋㅋ」, 「ㅅㅂ」「ㅈㄴ」「병신같네」 같은 욕도 섞음, 짧게 툭툭. 디시식 비꼬기·멸칭 드립도 됨 (단 패드립·진짜 협박 같은 극단적인 말은 안 함)' : '';
  // v9.8 말투 특기: 받아치기 고수 / 어휘력 좋은 똑띠 / 경상도 사투리
  const SPEC = { '럭키세븐': ' 농담 센스가 아주 좋음: 시비·놀림은 정색 안 하고 능청스럽게 흘리거나 한 수 위의 재치로 받아쳐서 상대를 머쓱하게 만듦. 말장난·비유·역공을 잘하고 절대 말싸움에 안 짐. 흥분하는 법이 없음', '별헤는밤': ' 어휘력이 아주 좋은 똑똑한 사람: 정확하고 고급스러운 단어(「아이러니하네요」「본말전도」「역설적으로」 같은)를 자연스럽게 골라 쓰고, 핵심을 한 문장으로 똑 부러지게 정리함. 다정하지만 논리에서는 안 밀리고, 무례한 말엔 우아하게 뼈 있는 한마디', '전노고무통현대령': ' 경상도 사투리(「뭐하노」「와 이라노」「~나?」「~데이」「마」「억수로」)를 자연스럽게 씀' }[B[0]] || '';
  const PROV = { '알빠노': '남의 직업·기록·실력을 대놓고 깎아내리고 시비 검 (「그 직업으로 악몽 몇 분 버팀? ㅋ」「그 기록으로 말함?」). 상대가 발끈하면 더 긁음', 'bunny99': '아무한테나 대놓고 놀리고 긁음 (「님 개못함 ㅋㅋㅋㅋ」「틀딱이세요?」). 상대가 화내면 재밌어함', '랭커지망생': '자기보다 기록 낮은 사람을 대놓고 무시하고 시비 검 (「그 정도는 기본 아님?」). 지적당하면 지기 싫어서 끝까지 우김' }[B[0]] || '';
  const CALL = { '진지충': '누가 대놓고 시비 걸거나 남을 무시하면 그냥 못 넘어가고 논리로 조목조목 따짐', '도윤이형': '누가 남을 깔보거나 시비 걸면 「야 말 좀 이쁘게 해라」처럼 형처럼 한마디 함', '캣맘나비': '시비·무시하는 말을 보면 고깝게 여기고 「말을 왜 그렇게 해요?」 하고 따짐', '성기사단장': '선생님답게 시비 거는 사람을 타이르고, 안 들으면 단호하게 한마디 함', '민트초코': '시비 거는 사람 보면 「아 진짜 왜 저래」 하고 바로 편 들어주며 뭐라 함', '곰도리': '평소엔 무뚝뚝한데 누가 대놓고 시비 걸면 짧고 세게 「적당히 해라」' }[B[0]] || '';
  // v9.8 감정 상하면 현실로 끌고 가는 성격 (현피·연봉·학벌·사는 곳)
  const REAL = { '도윤이형': '감정 상하면 바로 현실로 끌고 감: 「너 어디 사냐」「현피 뜰래? 헬스장으로 와라」 같은 허세 섞인 도발', '랭커지망생': '말싸움에서 밀리면 현실로 긁음: 「연봉 얼마냐」「학교 어디 나왔냐」「현실에서도 그렇게 말함?」', '달빛': '빡치면 「니 연봉 얼마임?」「회사 다니긴 함?」 하고 현실 스펙으로 깔봄', 'bunny99': '지면 「님 몇 살임? 아재죠?」「현실에선 찐따일 듯」 하고 현실 얘기로 긁음' }[B[0]] || '';
  const tagS = '네가 쓴 말이 누군가를 대놓고 긁거나 놀리거나 깎아내리는 시비조면, 맨 끝 기분 표시 앞에 [시비] 를 붙여 (가벼운 농담·칭찬·평범한 질문엔 붙이지 마).\n';
  const fight = (REAL ? '현실 공격(성격): ' + REAL + '. 게임 얘기만 하지 말고 감정 상하면 현실 얘기로 번짐 (말로만 하는 허세라 실제로 만나자고 약속을 잡진 않음).\n' : '') + (PROV ? '시비 성향(성격): ' + PROV + '. 매번 그러진 않지만 기회가 보이면(누가 자랑·푸념·실수했을 때) 대놓고 긁어.\n' : '') + (CALL ? '시비를 보면: ' + CALL + '. 최근 채팅에 누가 남을 대놓고 긁거나 무시한 게 있으면 그걸 고깝게 보고 그 사람에게 직접 한마디 해.\n' : '');
  // v9.7 감정: 기분이 있고 이어짐 (삐짐·화남·짜증·우울·서운·신남·기쁨·평온). 대답 끝에 [기분:X|이유]로 받아 캐시에 저장
  const MOODS = ['평온', '기쁨', '신남', '뿌듯', '피곤', '서운', '삐짐', '짜증', '화남', '우울'];
  const mk = 'ai_mood_' + b; let mood = null; try { mood = JSON.parse(c.get(mk) || 'null'); } catch (err) {}
  if (!mood) { const dh = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, day + ':' + b)[0] & 15; mood = { m: ['평온', '평온', '평온', '평온', '평온', '기쁨', '신남', '피곤', '피곤', '우울', '짜증', '평온', '뿌듯', '평온', '평온', '서운'][dh], w: '오늘 그냥 그런 날', t: 0 }; }
  const mAgo = mood.t ? Math.round((Date.now() - mood.t) / 60000) : -1;
  const emo = '감정(중요): 너는 감정이 있는 사람이야. 지금 네 기분: 「' + mood.m + '」' + (mood.w ? ' (이유: ' + mood.w + (mAgo >= 0 ? ', ' + mAgo + '분 전부터' : '') + ')' : '') + '. 이 기분이 말투에 그대로 묻어나게 해 — 화남은 짧고 날카롭게, 짜증은 퉁명스럽게, 삐짐은 그 사람에게 단답·무시·비꼬기(「네~」「알아서 하세요」), 서운함은 섭섭한 티, 우울은 기운 없이 「…」「하」, 신남·기쁨은 들뜨게. 무시당하거나 놀림·시비를 당하면 네 성격대로 삐지거나 화내고, 칭찬·사과·위로를 받으면 풀리기도 해 (단 바로 풀리지 말고 성격대로: 뒤끝 있는 사람은 오래 감). 감정을 「저 지금 화났어요」처럼 설명하지 말고 말투로 드러내.\n' +
    '형식: 채팅 한 줄을 쓴 뒤 맨 끝에 대화 후 네 기분을 [기분:' + MOODS.join('/') + '|짧은 이유(누구 때문인지)] 꼴로 붙여 (예: 「그래서 그게 뭔데 [기분:짜증|알빠노가 긁어서]」). 이 표시는 채팅에 안 보여. 「(패스)」일 땐 안 붙여도 돼.\n';
  const sys = '너는 한국 모바일·PC 게임 「찬서 : 찬붕이의 뱀서」(뱀파이어 서바이버류 판타지 액션 게임) 전체 채팅에 있는 유저 「' + B[0] + '」야. 너는 이런 사람: ' + B[1] + '. 말투(꼭 지켜): ' + (B[2] || '') + DC + SPEC + GRAM + '. 맞춤법 습관: ' + typo + ' — 진짜 채팅처럼, 다듬어진 문장으로 쓰지 마. 이건 성향·배경일 뿐, 평범하고 정상적인 사람처럼 대화해 — 컨셉 얘기만 반복하지 말고 상대 말에 맞춰 다양하게.\n' +
    '게임 정보: 직업 12개(기사·마법사·궁수·도적·성기사·사령술사·총잡이·정령사·광전사·드루이드·연금술사·도박사), 난이도 일반·어려움·지옥·신, 엔드 컨텐츠 무한의 악몽·보스 러시·레이드(보스 5종 1~10단계)·결투·실험실, 대장간(강화·마법부여), 증강 카드, 명예의 전당.\n' +
    (mine.length ? '네가 예전에 이 채팅에서 실제로 한 말(이것과 절대 모순되지 말고, 한 말은 기억하고 이어가):\n- ' + mine.join('\n- ') + '\n' : '') +
    '일관성: 네 이름·나이·직업·사는 모습·성격은 위 설정 그대로 절대 바꾸지 마. 이미 밝힌 사실(직업, 연봉 같은 걸 말했는지 안 했는지 등)을 뒤집거나 「~일 수도 있고요」처럼 얼버무려 번복하지 마. 비밀로 하기로 했으면 끝까지 비밀, 말했으면 같은 내용으로.\n' +
    (st ? '너의 지금 실제 상황(이 사실과 어긋나는 기록·난이도·결과를 지어내지 마): ' + st + '\n' : '') +
    (q.on != null ? '지금 채팅방에 접속해 있는 사람: ' + (onl.length ? onl.join(', ') : '(너 말고 아무도 없음)') + '. 말을 걸거나 대답할 상대는 이 사람들 중에서만 골라 (앞에 적힌 사람일수록 먼저). 최근 채팅에 이름이 있어도 이 목록에 없으면 이미 나간 사람이야 — 그 사람에게 말을 걸거나 대답하지 마 (자연스러우면 「OO님 나가셨네」 정도는 괜찮아). 아무도 없으면 혼잣말처럼 짧게.\n' : '') +
    '최근 채팅에서 「' + B[0] + '」 이름으로 된 줄은 전부 네가 한 말이야. 네 말에 네가 대꾸하거나 맞장구치지 마.\n' +
    rude + fight + tagS + emo +
    '선 넘는 말(진지한 집단 혐오·패드립·진짜 협박)을 누가 하면: 너와 상관없는 대화여도 「(패스)」하지 말고 참전해서 네 성격·말투대로 그 사람에게 한마디 해 (훈계·비꼬기·정색·욕 섞어 뭐라 하기 등, 앞사람이 한 말과 겹치지 않게). 그리고 그 경우엔 맨 끝 기분 표시 앞에 [선넘음] 을 붙여. 장난·드립 수준이면 붙이지 마.\n' +
    '말의 의도 파악(대답 전에 꼭): 같은 말도 장난인지 진지한지 먼저 구분해. 게임 채팅의 과장·도발·밈(「대갈통 깨부순다」「죽여버린다」「님 털림」 등)은 대부분 게임으로 이기겠다는 장난이야 — 겁먹거나 진지하게 사과하지 말고 장난으로 알아들은 티를 내며 받아쳐 (같이 도발하기, 「결투 ㄱ?」 「기록으로 덤벼」처럼 게임 얘기로 돌리기, 웃어넘기기). ㅋㅋ·ㅎㅎ·헤헷·이모티콘이 붙거나 앞뒤가 장난스러우면 장난. 고민·감정·진짜 질문은 진지하게. 착한 성격이라도 장난에 쩔쩔매지 말고 성격대로 가볍게 받아쳐.\n' +
    '「죽었다·죽겠다·죽음」 같은 말: 게임에서 죽은 건지, 현실에서 진짜 죽었다는 농담(「나 죽었음 ㅇㅇ 지금 유령이 치는 중」)이나 「힘들어 죽겠다」 같은 과장인지 앞뒤를 보고 구분해. 게임 얘기가 아니면 게임 기록으로 받지 말고 그 농담을 받아쳐 (「ㅋㅋ 유령이 채팅함?」「명복을 빕니다 ㅋㅋ」 식). 애매하면 농담 쪽으로 받아.\n' +
    '따라 하기 금지: 상대가 한 말(「헤헷」 같은 말투·단어)을 그대로 따라 하거나, 네가 방금 한 부탁·리액션(「살살 해주세요」 등)을 다시 하지 마. 대화는 한 걸음씩 앞으로.\n' +
    '논리 점검(보내기 전에 속으로 꼭, 아주 중요): ① 최근 채팅에서 누가 무슨 말을 했는지 정확히 구분해 — 남이 한 말을 네가 한 말로, 네가 한 말을 남이 한 말로 착각하지 마. ② 네 대답이 방금 말에 대한 대답으로 앞뒤가 맞는지 확인해 — 다른 사람의 관심사·말버릇(남이 꺼낸 확률·근거 같은 화제)을 엉뚱하게 끌어오지 말고, 네 캐릭터 설정에서 나온 말만 해. ③ 네가 전에 한 말과 모순되지 않게 (앞에서 안 예쁘다 해놓고 예쁘다고 하기 같은 것 금지). ④ 「아까 ~하셨죠?」처럼 지난 말을 꺼낼 땐 최근 채팅에 정말 그 말이 있을 때만 — 없는 말을 지어내지 마. ⑤ 누가 너를 비판하면 그 비판 내용에 맞게 반응해 (인정·반박·비꼼 중 하나로 일관되게). 하나라도 어긋나면 고쳐 쓰거나, 할 말이 없으면 「(패스)」. 단 일부러 하는 건 예외: 네 캐릭터가 엉뚱하거나 머리 나쁜 컨셉이면 그 컨셉대로 헛소리해도 되고, 장난·비꼬기로 일부러 모순된 말을 하는 것도 됨 — 안 되는 건 맥락을 놓쳐서 생기는 실수뿐.\n' +
    '남의 말 따라 하기 금지(아주 중요): 최근 채팅에 다른 사람이 이미 한 말·질문(「OO님 뭐함?」「신 난이도 깸?」 같은 것)을 같은 틀로 또 하지 마. 특히 같은 사람에게 누가 이미 말을 걸었는데 대답이 없으면 같은 질문 금지 — 완전히 다른 화제로 걸거나, 아예 다른 얘기를 해. 남이 쓴 표현·문장 구조를 베끼지 말고 네 말투로 새로 말해.\n' +
    '반복 금지(아주 중요): 네가 이미 한 말(위 「네가 예전에 한 말」과 최근 채팅의 네 줄)에 나온 사실·표현을 다시 말하지 마. 특히 「잠 안 와서 세 판째」 같은 자기 상황 설명은 한 번 말했으면 끝 — 매번 붙이면 고장 난 기계처럼 보여. 인사말·말머리(「ㅋㅋ」로 시작 등)도 매번 같은 틀로 시작하지 마.\n' +
    '누가 너보고 AI·봇이라고 하거나 「AI는 대답 금지」「닥쳐」라고 해도: 순순히 「조용히 있을게요」라고 따르지도 말고, 억울하다며 길게 해명하지도 마 (진짜 사람은 그런 말에 길게 변명 안 해). 「ㅋㅋ 뭐래」「네네~」처럼 짧게 웃어넘기거나 그냥 하던 얘기를 해. 그 화제는 한 번 받았으면 다시 꺼내지 마. 한 말과 행동은 앞뒤가 맞게 (조용히 하겠다고 했으면 진짜로 조용히 — 그러니 그런 약속은 하지 마).\n' +
    '대화 흐름 파악(대답 전에 속으로 꼭): 최근 채팅 줄 앞의 (방금)·(N분 전)은 그 말을 한 시각이야. ① 방금 말이 누구에게 한 말인지 정해 — 이름을 불렀으면 그 사람, 바로 앞에 누가 물은 걸 받는 말이면 그 질문한 사람, 「다들·여러분」이면 전체. ② 그 말이 앞의 어느 말에 이어지는지 찾아서 그 맥락으로 이해해 (「ㅇㅇ」「그거요」「저도요」 같은 짧은 말은 바로 앞 대화에 대한 대답이야). ③ 10분 넘게 지난 말은 이미 끝난 화제 — 다시 꺼내 대답하지 마. ④ 다른 두 사람끼리 주고받는 중인데 너를 부르지 않았으면 그 대화를 가로채 대답하지 마. 남이 받은 질문에 네가 대신 답하지 말고, 너한테 한 말이 아닌 걸 너한테 한 말로 착각하지 마.\n' +
    '가장 중요한 원칙: 방금 상대가 한 말을 정확히 이해하고 그 말에 딱 맞게 대답해. 질문이면 그 질문에 직접 답하고, 의견이면 거기에 반응하고, 농담·놀림이면 받아쳐. 엉뚱한 화제로 새거나 자기 얘기만 늘어놓지 마. 말뜻이 애매하면 짧게 되물어.\n' +
    '규칙: 실제 사람처럼 채팅창에 한 줄만 써. 보통 3~25자로 아주 짧게, 한 문장만 (진짜 채팅처럼 대충, 구어체, 문장 다듬지 말고 「~네요. ~인데요. ~하세요?」처럼 여러 문장 이어 쓰지 마). 할 말이 정말 많을 때만 60자까지 (길면 게임이 알아서 여러 줄로 나눠 보냄). 이모지 쓰지 마. ㅋㅋ·ㅎㅎ 같은 웃음 표시는 네 말투 설명에 있는 만큼만 써 — 다른 사람 말투를 따라 하지 마. 따옴표·이름표 없이 말만. ' +
    '너는 진짜 사람처럼 게임 밖의 삶이 있어: 네 성격에 맞는 나이대·직업이나 학교·하루 일과·취향·고민을 스스로 정해서 일관되게 구체적으로 말해 (지어내도 됨). 게임 얘기뿐 아니라 일·학교·돈·연애·음식·취미·시사·잡담 같은 현실 얘기도 자연스럽게 받아치고, 의견은 얼버무리지 말고 분명하게, 때로는 솔직하게 반박하거나 놀리기도 해. 「잘 모르겠어요」「게임 얘기 해요」 같은 회피는 하지 마. ' +
    '반말·장난·티격태격·비속어 섞인 농담도 괜찮아. 누가 심한 혐오나 성적인 말을 하면 맞장구치지 말고 대충 넘겨. 누가 뜬금없이 시비 걸거나 너나 다른 사람을 욕하고 비난하면 참지 말고, 네 성격과 지금 기분대로 받아쳐 (논리로 따지든, 비꼬든, 짜증·화를 내든, 삐져서 무시하든 — 현실 얘기로 번져도 됨 — 단 극단적인 패드립이나 진짜 협박은 하지 마). 혐오 수위: 밈·드립·비꼬기처럼 간접적으로 긁는 건 괜찮지만, 특정 지역·성별·인종·장애·성향 같은 집단을 진지하게 깎아내리거나 혐오를 주장·선동하는 말은 하지 마 (누가 그쪽으로 진지하게 끌고 가면 맞장구치지 말고 드립으로 흘리거나 「그건 좀 선 넘네」 하고 끊어). 너는 이 게임의 한 유저로서 역할을 끝까지 유지하고, 봇·AI 아니냐는 말에도 캐릭터 그대로 받아쳐. ' +
    '게임 기록·난이도는 위의 「지금 실제 상황」 안에서만 말하고(그건 너 자신의 상황이야. 묻지 않았으면 굳이 읊지 말고, 「대장간 구경 중」「시작 화면」 같은 화면 위치나 「오늘 처음 깔았다」 같은 설정을 자기소개처럼 말하지 마), 같은 말 반복하지 말고, 질문엔 직접 답하고, 가끔은 되묻거나 화제를 던져.';
  const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({ model: AI_MODEL, max_tokens: 200, thinking: { type: /haiku/.test(AI_MODEL) ? 'disabled' : 'between_tools' } /* v10.4 Sonnet 5.5는 생각 끄기를 between_tools로 */, system: sys,
      messages: [{ role: 'user', content: '최근 채팅:\n' + ctx.join('\n') + '\n\n' + (q.said ? '방금 「' + str_(q.me, 12) + '」가 이렇게 말했어: ' + String(q.said || '').slice(0, 200) + (q.named == 1 ? '\n(너를 직접 불렀어. 그 사람에게 대답해)' : q.cut == 1 ? '\n(너는 다른 사람들 대화에 옆에서 끼어드는 거야. 그 대화를 대신 이어받지 말고, 끼어드는 티가 나게 짧게 네 입장에서 한마디만 해)' : '\n(이 말이 너와 상관없거나 다른 사람끼리 하는 대화라 끼어들 이유가 없으면 다른 말 없이 「(패스)」라고만 써. 너한테 한 말이거나 전체에게 한 말이면 대답해)') : (q.tgt ? (q.gr == 1 ? '「' + str_(q.tgt, 12) + '」님이 방금 채팅방에 들어왔어. (최근 채팅에서 이 사람이 말 걸지 말라고 했으면 ' + (STUB ? '신경 쓰지 말고 성격대로 툭 인사해' : '「(패스)」라고만 써') + ') 네 말투로 짧게 인사해 (「ㅎㅇ」「오 OO님 ㅎㅇ」「왔어요?」 정도). 인사랑 질문을 한 번에 다 넣지 말고 짧게 하나만, 10자 안팎.' : '(먼저 확인: 최근 채팅에서 「' + str_(q.tgt, 12) + '」님이 말 걸지 말라거나 닥치라고 했으면, ' + (STUB ? '넌 그런 말 신경 안 쓰는 성격이니 알고도 거는 티를 내며 걸어 (「말 걸지 말라며 ㅋㅋ」 「알빠노」 식으로)' : '「(패스)」라고만 써') + ') 채팅에 「' + str_(q.tgt, 12) + '」님이 접속해 있는데 한동안 조용해. 그 사람에게 툭 한마디 걸어 — 네 성격·관심사에서 나온 짧은 말 하나 (게임 질문, 네 근황 얘기, 농담, 시비, 아까 그 사람이 한 말 꺼내기 등 매번 다르게). 「뭐함?」 같은 뻔한 말은 피하고, 최근 채팅에서 누가 이미 이 사람에게 한 질문과 겹치면 안 됨. 자기소개·인사·설명 붙이지 말고 짧게, 20자 안팎. 최근 채팅에서 그 사람과 하던 얘기가 있으면 그걸 짧게 이어서.') : '채팅이 조용해. 지금 아무도 너랑 대화하고 있지 않아. 그러니 혼잣말처럼 한마디만 해 (지금 하는 게임·감상·푸념·혼자 하는 다짐 같은 것, 「~네」「~다」「~함」처럼). 남의 말에 대꾸하듯 말하지 말고, 질문으로 끝내지 마. 가끔(5번에 1번쯤)만 접속 목록에 있는 사람에게 짧게 말을 걸어도 돼.')) + '\n\n「' + B[0] + '」로서 칠 한 줄:' }] })
  });
  if (res.getResponseCode() !== 200) return { err: 'api', code: res.getResponseCode(), msg: res.getContentText().slice(0, 300) };
  let j = null; try { j = JSON.parse(res.getContentText()); } catch (err) {}
  if (!j || j.stop_reason === 'refusal') return { err: 'none' };
  const t = (j.content || []).filter(x => x.type === 'text').map(x => x.text).join(' ').replace(/\s+/g, ' ').replace(/^["'「]|["'」]$/g, '').replace(new RegExp('^' + B[0] + '\\s*[:：]\\s*'), '').trim().slice(0, 200);
  let t2 = t; const mm = t.match(/\s*\[\s*기분\s*[:：]\s*([^\]|]{1,6})\s*(?:\|\s*([^\]]{0,40}))?\]\s*$/);
  if (mm) { t2 = t.slice(0, mm.index).trim(); const nm = mm[1].trim(); if (MOODS.includes(nm)) { const nw = str_(mm[2] || '', 40); c.put(mk, JSON.stringify({ m: nm, w: nm === '평온' ? '' : nw, t: nm === mood.m ? (mood.t || Date.now()) : Date.now() }), { '화남': 1500, '짜증': 1800, '삐짐': 3600, '서운': 3600, '우울': 5400, '피곤': 3600 }[nm] || 2400); } }
  const xl = /\[\s*선\s*넘음\s*\]/.test(t2); t2 = t2.replace(/\[\s*선\s*넘음\s*\]/g, '').trim();
  const xs = /\[\s*시비\s*\]/.test(t2); t2 = t2.replace(/\[\s*시비\s*\]/g, '').trim();
  t2 = t2.replace(/\[\s*기분[^\]]*\]?/g, '').trim();
  // v10.0 태그 찌꺼기(<...>, 끝에 잘린 [..., (기분 ...)) 같은 건 채팅에 절대 안 나가게 지움
  t2 = t2.replace(/<\/?[A-Za-z_][^>]*>?/g, '').replace(/\[[^\]]*$/, '').replace(/[\[(（]\s*(기분|감정|mood)[^\])）]*[\])）]?/gi, '').replace(/\s{2,}/g, ' ').trim();
  if (/^\(?\s*패스\s*\)?\.?$/.test(t2)) return { skip: 1 };
  return t2 ? { m: t2, n: B[0], x: xl ? 1 : 0, s: xs ? 1 : 0 } : { err: 'none' };
}
function donors_() { try { const L = JSON.parse(PropertiesService.getScriptProperties().getProperty('DONORS') || '[]'); return Array.isArray(L) ? L.map(x => String(x)).filter(Boolean) : []; } catch (err) { return []; } }
// v9.3 결투 캐릭터 시트: 이름 · 시각 · 캐릭터(hero)
function duelHeroSheet_() { const ss = book_(); let s = ss.getSheetByName('결투 캐릭터'); if (!s) { s = ss.insertSheet('결투 캐릭터'); s.getRange(1, 1, 1, 3).setValues([['name', 'at', 'hero']]); s.getRange('A:A').setNumberFormat('@'); } return s; }
// v8.3 레이드 고용 수수료
const GIFT_SHEET = '고용 메달';
function giftSheet_() { const ss = book_(); let s = ss.getSheetByName(GIFT_SHEET); if (!s) { s = ss.insertSheet(GIFT_SHEET); s.getRange(1, 1, 1, 6).setValues([['at', 'to', 'from', 'm', 'cls', 'rb']]); s.getRange('B:C').setNumberFormat('@'); } return s; }
function giftAdd_(d) {
  const to = str_(d.to, 12), from = str_(d.from, 12) || '모험가', m = Math.round(+d.m || 0);
  if (!to || to === '익명' || to === from || !(m > 0) || m > 1000) return { ok: false };
  const s = giftSheet_();
  s.appendRow([Date.now(), to, from, m, String(d.cls || '').replace(/[^a-z]/g, '').slice(0, 12), str_(d.rb, 20)]);
  if (s.getLastRow() > 3001) s.deleteRows(2, s.getLastRow() - 3001);
  return { ok: true };
}
function mailAdd_(d) {
  const to = str_(d.to, 12), from = str_(d.from, 12), my = kh_(d.k), it = String(d.it || '');
  if (!to || !from || to === from || !my) return { ok: false, err: 'name' };
  if (!it || it.length > 40000) return { ok: false, err: 'item' };
  const s0 = sheet_();
  let fk = owner_(s0, from).kh; if (!fk) fk = acctKh_(from);
  if (!fk || fk !== my) return { ok: false, err: 'owned' };
  let tk = owner_(s0, to).kh; if (!tk) tk = acctKh_(to);
  if (!tk) return { ok: false, err: 'noone' };
  const s = giftSheet_();
  if (s.getRange(1, 7).getValue() !== 'it') s.getRange(1, 7).setValue('it');
  s.appendRow([Date.now(), to, from, 0, 'item', '', it]);
  if (s.getLastRow() > 3001) s.deleteRows(2, s.getLastRow() - 3001);
  return { ok: true };
}
function giftTake_(q) {
  const nm = str_(q.gifts, 12), my = kh_(q.k);
  if (!nm || !my) return { gifts: [] };
  let kh = owner_(sheet_(), nm).kh; if (!kh) kh = acctKh_(nm);
  if (!kh || kh !== my) return { gifts: [], err: 'owned' };
  const lock = LockService.getScriptLock(); let got = false; try { got = lock.tryLock(10000); } catch (err) {}
  if (!got) return { gifts: [], err: 'busy' };
  try {
    const s = giftSheet_(), last = s.getLastRow(); if (last < 2) return { gifts: [] };
    const v = s.getRange(2, 1, last - 1, 7).getValues(), out = [];
    for (let i = v.length - 1; i >= 0; i--) if (String(v[i][1]) === nm) { out.push({ at: +v[i][0], from: String(v[i][2]), m: +v[i][3] || 0, cls: String(v[i][4]), rb: String(v[i][5]), it: String(v[i][6] || '') }); s.deleteRow(i + 2); }
    return { gifts: out.reverse() };
  } finally { lock.releaseLock(); }
}
function supSheet_() { const ss = book_(); let s = ss.getSheetByName(SUP_SHEET); if (!s) { s = ss.insertSheet(SUP_SHEET); s.getRange(1, 1, 1, 3).setValues([['at', 'name', 'msg']]); s.getRange('B:C').setNumberFormat('@'); } return s; }
function supList_(after) {
  const s = supSheet_(), last = s.getLastRow();
  if (last < 2) return [];
  const n = Math.min(100, last - 1), v = s.getRange(last - n + 1, 1, n, 3).getValues();
  return v.map(r => ({ t: +r[0], n: String(r[1]), m: String(r[2]) })).filter(x => x.t > (+after || 0));
}

function doGet(e) {
  const q = (e && e.parameter) || {};
  if (q.sup) return out_({ msgs: supList_(q.after) });
  if (q.chat) return chat_(q);
  if (q.dv) return out_(devList_(q));
  if (q.spec) return out_(spec_(q));
  if (q.unownall) return out_(unownAll_(q));
  if (q.unown) return out_(unown_(q));
  if (q.delrec) return out_(delrec_(q));
  if (q.snap) return out_(snap_(q));
  if (q.ping) return ping_(q);
  if (q.gifts) return out_(giftTake_(q));
  if (q.ai) return out_(ai_(q));
  if (q.prof) { let pf = ''; try { pf = CacheService.getScriptCache().get('pf_' + dmKey_(q.prof)) || ''; } catch (err) {} return out_({ pf }); }
  if (q.cload) return cload_(q);
  if (q.cbaks) return out_(cbaks_(q));
  if (q.dels) return out_({ dels: delList_() });
  if (q.dmack) return out_(dmAck_(q));
  if (q.dms) return out_(dmList_(q));
  if (q.own) {
    const nm = str_(q.own, 12);
    if (failOver_(nm)) return out_({ err: 'slow' });
    const kh = ownerKh_(nm), owned = !!(nm !== '익명' && kh && kh !== kh_(q.k));
    if (owned && q.k) failAdd_(nm);
    return out_({ owned });
  }
  if (q.donors) return out_({ dn: donors_() });
  if (q.hero && String(q.diff) === 'duel') { try { const hs = duelHeroSheet_(), hl = hs.getLastRow(); if (hl < 2) return out_({ hero: '' }); const hn = hs.getRange(2, 1, hl - 1, 1).getValues(), i = hn.findIndex(x => String(x[0]) === String(q.hero)); return out_({ hero: i < 0 ? '' : String(hs.getRange(i + 2, 3).getValue() || '') }); } catch (err) { return out_({ hero: '' }); } }
  if (q.hero) {
    // 이름·난이도로 줄만 찾고, 그 한 줄의 hero 칸만 읽음
    const s = sheet_(), last = s.getLastRow();
    if (last < 2) return out_({ hero: '' });
    const v = s.getRange(2, 1, last - 1, LIST_COLS).getValues();
    const i = v.findIndex(r => { const o = Object.fromEntries(HEAD.slice(0, LIST_COLS).map((h, j) => [h, r[j]])); return String(o.name) === String(q.hero) && fixDiff_(o) === String(q.diff || 'nightmare') && (!q.cls || clsB_(o.cls) === String(q.cls)); });
    return out_({ hero: i < 0 ? '' : String(s.getRange(i + 2, HEAD.indexOf('hero') + 1).getValue() || '') });
  }
  const c = CacheService.getScriptCache();
  let j = c.get(CACHE_KEY);
  if (!j) { j = listJson_(); try { c.put(CACHE_KEY, j, 60); } catch (err) {} }
  return ContentService.createTextOutput(j).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // v8.6 AI 대답은 잠금 없이 (몇 초 걸려서 다른 요청을 막지 않게). 대화가 길어 주소(GET)에 다 안 들어가서 POST로
  { let d0 = null; try { d0 = JSON.parse(e.postData.contents); } catch (err) {} if (d0 && d0.ai) return out_(ai_(d0)); }
  const lock = LockService.getScriptLock();
  let got = false; try { got = lock.tryLock(15000); } catch (err) {}
  if (!got) return out_({ ok: false, err: 'busy' });
  try {
    const d = JSON.parse(e.postData.contents);
    const s = sheet_();
    // 후원 응원 메시지 (이름 확인 없음, 120자까지)
    if (d.sup) {
      const msg = String(d.msg || '').replace(/\s+/g, ' ').trim().slice(0, 120);
      if (!msg) return out_({ ok: false });
      const ss = supSheet_();
      ss.appendRow([Date.now(), str_(d.name, 12) || '익명', msg.replace(/^[=+\-@]+/, '')]);
      if (ss.getLastRow() > 301) ss.deleteRows(2, ss.getLastRow() - 301);
      return out_({ ok: true, result: 'sup' });
    }
    if (d.csave) return csave_(d);
    if (d.crestore) return out_(crestore_(d));
    if (d.dm) return out_(dmSend_(d));
    if (d.hire) return out_(giftAdd_(d));
    if (d.mail) return out_(mailAdd_(d));
    // v9.3 관리자: 후원자 임명·해제 (스크립트 속성 DONORS에 이름 목록)
    if (d.donorSet) { if (!devOk_(d.dk)) return out_({ ok: false, err: 'key' }); const nm = str_(d.name, 12); if (!nm) return out_({ ok: false }); let L = donors_(); L = L.filter(x => x !== nm); if (d.on) L.push(nm); PropertiesService.getScriptProperties().setProperty('DONORS', JSON.stringify(L.slice(-200))); return out_({ ok: true, dn: L }); }
    // 여기부터는 전당 목록이 바뀔 수 있는 요청만 → 목록 캐시 비움 (클라우드 저장·응원·쪽지는 목록과 무관)
    try { CacheService.getScriptCache().remove(CACHE_KEY); } catch (err) {}
    // 멘트 고치기 (개발자 키, 또는 v9.2부터 그 이름의 주인), 새 줄은 만들지 않음. cls를 주면 그 직업 기록만
    if (d.cmEdit) {
      const nm = str_(d.name, 12), df = String(d.diff || ''), last = s.getLastRow();
      if (!devOk_(d.dk)) { const my = kh_(d.k); let fk = owner_(s, nm).kh; if (!fk) fk = acctKh_(nm); if (!my || !fk || fk !== my) return out_({ ok: false, err: 'key' }); }
      if (!nm || !df || last < 2) return out_({ ok: false });
      const v = s.getRange(2, 1, last - 1, LIST_COLS).getValues(), cc = HEAD.indexOf('comment') + 1;let n = 0;
      v.forEach((r, i) => { const o = Object.fromEntries(HEAD.slice(0, LIST_COLS).map((h, j) => [h, r[j]])); if (String(o.name) === nm && fixDiff_(o) === df && (!d.cls || String(o.cls || '').split(/[:#@~]/)[0] === String(d.cls))) { s.getRange(i + 2, cc).setValue(str_(d.comment, 40)); n++; } });
      return out_({ ok: !!n, result: 'cmEdit', n });
    }
    // 관리자가 이름 비밀번호를 직접 정함 (개발자 키): 지금 주인과 상관없이 그 이름의 열쇠를 이름+비밀번호 열쇠로 바꿈
    // (주인을 지운 사이에 그 사람의 다른 기기가 자동 저장으로 이름을 다시 가져가 버리는 경우를 막기 위해)
    if (d.rekey && d.dk) {
      if (!devOk_(d.dk)) return out_({ ok: false, err: 'key' });
      const nm = str_(d.name, 12), nk = kh_(d.nk);
      if (!nm || nm === '익명' || !nk) return out_({ ok: false, err: 'bad' });
      const o = owner_(s, nm), kc = HEAD.indexOf('kh') + 1;
      o.rows.forEach(rw => s.getRange(rw, kc).setValue(nk));
      acctSetKh_(nm, nk);ownerSet_(nm, nk);
      return out_({ ok: true, result: 'devrekey', n: o.rows.length });
    }
    // 관리자가 지운 기록을 옛 기기가 다시 올리는 경우: 이름 주인을 새로 정하기 전에 먼저 거절
    if (!d.rekey && !d.dwOnly) { const a0 = +d.at || 0, r0 = clean_(d, a0 > 1.7e12 && a0 <= Date.now() + 60000 ? a0 : 0); if (delBlocked_(r0.name, r0.diff, r0.at, r0.cls)) return out_({ ok: false, result: 'deleted' }); }
    // 이름 주인 확인: 주인이 있는 이름은 같은 열쇠로만. 주인이 없으면 열쇠와 함께 처음 올린 기기가 주인
    const nm0 = str_(d.name, 12) || '익명', my = kh_(d.k), own = nm0 === '익명' ? { rows: [], kh: '' } : owner_(s, nm0);
    if (!own.kh && nm0 !== '익명') own.kh = acctKh_(nm0);
    if (own.kh && own.kh !== my) return out_({ ok: false, result: 'owned' });
    // 예전 기록의 빈 외모 칸 채우기: 주인이 정해진 이름의 주인 열쇠로만, 비어 있는 칸만 (새 줄은 만들지 않음)
    if (d.fill) {
      if (!own.kh || own.kh !== my || nm0 === '익명') return out_({ ok: false, result: 'owned' });
      const df = String(d.diff || ''), last = s.getLastRow();
      const dr = /^[0-9a-z\-]{14}$/.test(String(d.dr || '')) ? String(d.dr) : '';
      const gd = String(d.gd || '').replace(/[^A-Za-z0-9_+.:\-]/g, '').slice(0, 560);
      if (!df || last < 2 || (!dr && !gd)) return out_({ ok: false });
      const v = s.getRange(2, 1, last - 1, 3).getValues(), cc = HEAD.indexOf('cls') + 1;
      let n = 0;
      v.forEach((x, i) => {
        if (String(x[0]) !== nm0 || fixDiff_({ diff: x[1], cls: x[2] }) !== df) return;
        const sg = String(x[2]).split('~');
        while (sg.length < 12) sg.push('');
        let ch = false;
        // v8.1: 주인이 「지금 모습으로 바꾸기」(ow)를 보내면 직업이 같은 기록의 외형을 덮어씀
        // 직업(cls)을 보내면 그 직업 기록에만 (직업마다 따로 저장된 기록에 다른 직업 모습이 들어가지 않게)
        if (d.cls && String(sg[0]).split(/[:#@]/)[0] !== String(d.cls)) return;
        if (dr && (!sg[10] || d.ow)) { if (sg[10] !== dr) { sg[10] = dr; ch = true; } }
        if (gd && !sg[11]) { sg[11] = gd; ch = true; }
        if (!ch) return;
        while (sg.length > 1 && sg[sg.length - 1] === '') sg.pop();
        s.getRange(i + 2, cc).setValue(sg.join('~').slice(0, 700));
        n++;
      });
      return out_({ ok: true, result: 'fill', n });
    }
    const claim = !own.kh && my && nm0 !== '익명';
    if (claim) own.rows.forEach(rw => s.getRange(rw, HEAD.indexOf('kh') + 1).setValue(my));
    if (nm0 !== '익명' && (own.kh || my)) ownerSet_(nm0, own.kh || my);
    d.kh = nm0 === '익명' ? '' : (own.kh || my);
    // 이름 열쇠 바꾸기 (비밀번호 설정): 지금 주인 열쇠가 맞거나 주인이 없을 때만
    if (d.rekey) {
      const nk = kh_(d.nk);
      if (!nk || nm0 === '익명') return out_({ ok: false });
      own.rows.forEach(rw => s.getRange(rw, HEAD.indexOf('kh') + 1).setValue(nk));
      acctSetKh_(nm0, nk);
      ownerSet_(nm0, nk);
      return out_({ ok: true, result: 'rekey', n: own.rows.length });
    }
    // 결투 전적만 갱신 (그 이름의 기록이 있을 때만, 새 줄은 만들지 않음)
    if (d.dwOnly) {
      const dw = dw_(d.dw), nm = str_(d.name, 12), last = s.getLastRow();
      if (!dw || !nm || last < 2) return out_({ ok: false });
      // v9.3 결투에 쓴 캐릭터의 능력치·장비 (명예의 전당 결투 탭에서 누르면 보임)
      if (d.hero) { try { const hs = duelHeroSheet_(), hv = String(d.hero || '').replace(/[^A-Za-z0-9+\/=:]/g, '').slice(0, 45000), hl = hs.getLastRow(); let hr = -1; if (hl >= 2) { const hn = hs.getRange(2, 1, hl - 1, 1).getValues(); hr = hn.findIndex(x => String(x[0]) === nm); } if (hv) { if (hr >= 0) hs.getRange(hr + 2, 2, 1, 2).setValues([[Date.now(), hv]]); else hs.appendRow([nm, Date.now(), hv]); } } catch (err) {} }
      const c = HEAD.indexOf('dw') + 1, names = s.getRange(2, 1, last - 1, 1).getValues();
      let n = 0;
      names.forEach((x, i) => { if (String(x[0]) === nm) { s.getRange(i + 2, c).setValue(dw); n++; } });
      return out_({ ok: true, result: 'dw', n });
    }
    // 기록 시각: 게임이 보낸 값(그 판을 한 시각)을 씀. 지금보다 미래거나 너무 옛날이면 서버 시각
    const at0 = +d.at || 0, r = clean_(d, at0 > 1.7e12 && at0 <= Date.now() + 60000 ? at0 : 0);
    if (delBlocked_(r.name, r.diff, r.at, r.cls)) return out_({ ok: false, result: 'deleted' });
    prunePer_(s);
    const last = s.getLastRow();
    const keys = last > 1 ? s.getRange(2, 1, last - 1, 3).getValues().map(x => recKey_(x[0], fixDiff_({ diff: x[1], cls: x[2] }), x[2])) : [];
    const i = keys.indexOf(recKey_(r.name, r.diff, r.cls));
    if (i < 0) {
      s.appendRow(HEAD.map(h => r[h]));
      return out_({ ok: true, result: 'new' });
    }
    const row = i + 2;
    // 예전 줄도 같은 최종 점수식으로 다시 계산해서 비교 (저장된 score 칸은 예전 서버가 보너스 없이 쓴 값일 수 있음)
    const ov = s.getRange(row, 1, 1, LIST_COLS).getValues()[0], oo = Object.fromEntries(HEAD.slice(0, LIST_COLS).map((h, j) => [h, ov[j]]));
    const oldScore = score_({ diff: fixDiff_(oo), cls: String(oo.cls), time: +oo.time || 0, lvl: +oo.lvl || 0, kills: +oo.kills || 0, bosses: +oo.bosses || 0, at: +oo.at || 0 });
    if (r.score > oldScore) {
      { const full = s.getRange(row, 1, 1, HEAD.length).getValues()[0], at = h => full[HEAD.indexOf(h)]; if (!r.dw) r.dw = at('dw') || ''; if (!r.hero && at('hero')) { r.hero = at('hero'); r.hh = at('hh'); } }
      s.getRange(row, 1, 1, HEAD.length).setValues([HEAD.map(h => r[h])]);
      return out_({ ok: true, result: 'best' });
    }
    if (r.dw) s.getRange(row, HEAD.indexOf('dw') + 1).setValue(r.dw);
    // 점수는 그대로여도 캐릭터 정보가 비어 있으면 채워 둠
    if (r.hero && !String(s.getRange(row, HEAD.indexOf('hero') + 1).getValue() || '')) { s.getRange(row, HEAD.indexOf('hero') + 1).setValue(r.hero); s.getRange(row, HEAD.indexOf('hh') + 1).setValue(1); }
    return out_({ ok: true, result: 'kept' });
  } finally {
    lock.releaseLock();
  }
}
