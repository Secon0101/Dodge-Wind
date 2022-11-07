# Dodge Wind
<div align="center">
  <img src="https://user-images.githubusercontent.com/77004054/200261869-dcf1cace-6fe9-4145-94cb-794638124fe8.png" width="60%">
</div>

<br>

플레이 - **https://secon0101.github.io/Dodge-Wind/**

## 개발 동기
[openweathermap.org](https://openweathermap.org/)에서 날씨 데이터를 크롤링했을 때, 그 지역의 풍속과 방향에 대한 데이터가 있었다. 이걸 이용해서 바람 때문에 움직임이 방해받는 컨트롤 게임을 만들면 재밌을 것 같다는 생각이 들었다.

## 소개
화면 가장자리에서 **탄막**이 생성되어 플레이어를 향해 날아온다. 탄막은 벽에 닿으면 튕긴다.

탄막을 피해서 최대한 오래 살아남아야 한다.

현재 지역의 **풍속과 방향** 데이터를 가져와서, 게임 상에 바람이 분다.
오른쪽 아래에 현재 지역과 바람을 볼 수 있다.

눈이 오는 날씨라면 비 대신 눈이 내린다.

## 조작법
조작: **A W D** or **← ↑ →** + **Space**

지역 바꾸기: **P**

지역 예시: `Japan`, `China`, `Paris`, `America` 등

디버그 콘솔에 `weather = "Snow"`를 입력하면 눈이 옵니다.

## 기타
자바스크립트 웹게임 개발특강 프로젝트

using `<canvas>`

제작 기간: 1일
