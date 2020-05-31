# NODE-SERVER 


**노드 Rest API** + **Mongo DB** with Mongoose 공부를 위한
게시판 토이 프로젝트
### 개발기록
## 동작 정의
---
 - 사용자 인증 구현
   - 패스워드 암호화 저장
   - JWT를 이용한 토큰 생성 후 전달 + 클라이언트 헤더를 통해 토큰을 확인 후 인증
   - oauth2 사용 고려 

 - 게시판 동작 구현
   - 게시판 전체 조회, 글 작성, 수정, 삭제 기능 구현
   - 인증된 사용자만 작성, 수정, 삭제 가능
 - http request
   - POSTMAN 을 통해 요청과 응답을 확인하자
   - API 구현이 완성되면 React를 이용해 게시판 front를 구성하자

## 개발 일지
---
### #1 : 사용자 인증 구현
미리 만들어 놓은 사용자 인증을 더욱 깔끔한 구조로 수정하는 작업을 한다.

현재 사용자 인증은 다음과 같이 이루어진다.

    1. 사용자 등록
        1) POST 메소드로 ID와 password를 확인
        2) Mongo DB 의 users 컬렉션을 조회해 동일한 ID가 있는지 확인
        3) 동일한 ID가 없는 경우
            - 첫 번째 유저라면 관리자 설정
            - 패스워드 암호화하고 users 컬렉션에 저장
            - 성공 응답과 함께 성공 메시지 전송
        4) 동일한 ID가 있다면 실패 응답와 함께 실패 메시지 전송

    2. 로그인
        1) POST 메소드로 ID와 password를 받음
        2) users 컬렉션에서 ID 조회하고 없다면 상태 응답 409와 함께 실패 메시지 전송
        3) ID가 있다면 해당 다큐먼트의 password 확인
            - 맞았을 경우 토큰 생성하고 바디에 포함시켜 상태 200 전달
            - 틀렸을 경우 오류 응답 

    3. 토큰 인증 절차
        1) GET 메소드로 Header에 x-access-token 정보를 확인
        2) 해당 토큰을 verify후 디코딩
        3) 토큰이 유효한다면 디코딩된 정보를 성공 응답과 함께 전송
        4) 토큰이 잘못되었거나 만기되었다면 오류 응답


## 고민
___

#### 토큰 인증 절차를 어디에 두어야 최소한의 인증으로 세션을 유지시킬 수 있을까


#### 사용자와 게시글을 연결하는 가장 좋은 구조는 무엇일까
 - user가 post의 ref를 기억하는 방법
   - user 별로 post 목록을 보여줄 때 유용할 것 같다.
 - post가 user의 ref를 기억하는 방법
   - post를 생성하는 작업이 간편할 듯 하다.

#### 어려웡 ㅋ