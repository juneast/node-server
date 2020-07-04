# NODE-SERVER 
API 서버

## API
### #1 : 사용자 인증
    1. 사용자 등록 (POST : /api/register)
        1) body에서 ID와 password를 확인
        2) Mongo DB 의 users 컬렉션을 조회해 동일한 ID가 있는지 확인
        3) 동일한 ID가 없는 경우
            - 첫 번째 유저라면 관리자 설정
            - 패스워드 암호화하고 users 컬렉션에 저장
            - 성공 응답과 함께 성공 메시지 전송
        4) 동일한 ID가 있다면 실패 응답와 함께 실패 메시지 전송

    2. 로그인 (POST : /api/login)
        1) body에서 ID와 password를 받음
        2) users 컬렉션에서 ID 조회하고 없다면 상태 응답 409와 함께 실패 메시지 전송
        3) ID가 있다면 해당 다큐먼트의 password 확인
            - 맞았을 경우 토큰 생성하고 바디에 포함시켜 상태 200 전달
            - 틀렸을 경우 오류 응답 

    3. 토큰 인증 절차 (미들웨어)
        1) header의 x-access-token 정보를 확인
        2) 해당 토큰을 verify후 디코딩
        3) 토큰이 유효한다면 디코딩된 정보를 성공 응답과 함께 전송
        4) 토큰이 잘못되었거나 만기되었다면 오류 응답
### #2 : 게시글 CRUD
    1. 게시글 등록 (POST : /api/post)
        1) 토큰 인증 절차를 선행해야 함 (미들웨어 등록)
        2) 토큰에 기록된 ObjectId를 Post Model에 붙여서 등록
        3) 응답메시지에 post_id 전달

    2. 게시글 조회 (GET : /api/post)
        성공시
            게시글 1개 이상 : 상태코드 200과 1개 이상 10개 이하의 게시글 반환
            게시글 없을 때 : 상태코드 204 반환
        2) populate를 이용해 게시글과 User를 연결함

    3. 게시글 수정 (PUT : /api/post/postid)
        1) url에서 post_id를 확인
        2) post_id를 조회해 해당 document의 title, content 수정
        3) nModified가 1이라면 성공 응답, 그 외엔 실패 응답

    4. 게시글 삭제 (DELETE : /api/post/postid)
        1) url에서 postid 확인 후 해당 document 삭제
        2) deletedCount가 1이라면 성공 응답, 그 외엔 실패 응답

### #3 : 댓글 CRD
    1. 댓글 등록 (POST : /api/comment/postid)
        1) 토큰 정보의 user id 확인
        2) postid를 통해 post의 object id를 조회하고 comment 모델에 입력
        3) request body 정보를 모델에 입력, 컬렉션에 저장

    2. 특정 게시글의 댓글 조회 (GET : /api/comment/postid) 
        1) postid를 통해 post의 object id를 조회
        2) post object id와 매칭되는 정보 조회
        3) 조회하면서 populate({path:'author', select : 'userId'}) 사용
        4) 조회된 정보 전송

    3. 댓글 삭제 (DELETE : /api/comment/commentid)
        1) url의 commentid에 해당하는 comment 삭제

### #4 : ROOM 생성, 조회
    1. 룸 등록 (POST : /api/room)
        1) 방에 함께 등록할 유저들을 request body에
            예시)
            "userList" : [
                "recode",
                "HETBAN",
                "LIM"
            ]
            함께 전송
        2) userList 중에 유효하지 않은 아이디가 있을 시 오류
        3) 해당 조합으로 이루어진 방이 이미 있을시 오류
    2. 룸 조회 (GET : /api/room)
        1) 쿠키의 userid 를 바탕으로 해당 유저의 room list 조회
            