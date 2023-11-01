let videos;

const apiSeoyoujin = "AIzaSyBsUlzD25HkoZHs8O9Q70QYDTLfkhzgMNs";
const apiKimgitae = "AIzaSyCXHHuVRVF-aPfvs-xKetrS8Z7NXwxzeTA";
let apiKey = apiSeoyoujin;

let videoNameList = [];
let videoLinkList = [];

let countNames = [];
let countDatas = [];

let keyword = "ASMR";

function setup() {
  document.getElementById("keyword").value = keyword;
  searchASMRVideos();
}

function changekeyWord() {
  keyword = document.getElementById("keyword").value;
  searchASMRVideos();
}

function drawChartSetup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
}

//최대 50
function searchASMRVideos() {
  const url = `https://www.googleapis.com/youtube/v3/search?order=viewCount&part=snippet
  &regionCode=KR&maxResults=100&q=${keyword}&type=video&key=${apiKey}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      videos = data.items;
      fetchVideos();
      print(videoNameList);
      drawChart();
      let title = document.getElementById("title");
      if (videos.length == 0 || videos == null) {
        title.innerText = "api 만료";
      } else {
        title.innerText = `유튜브에서 ${keyword} 영상 제목 첫단어 비율`;
      }
    })
    .catch((error) => {
      if (apiKey === apiKimgitae) {
        document.getElementById("title").innerText =
          "network 에러, api 키 만료";
      } else {
        apiKey = apiKimgitae;
        searchASMRVideos();
      }
    });
}

function fetchVideos() {
  if (!videos) {
    console.error("Invalid videos array:", videos);
    return;
  }

  const videoList = document.getElementById("videolist");

  while (videoList.firstChild) {
    videoList.removeChild(videoList.firstChild);
  }

  videoNameList = [];
  videoTitleList = [];

  videos.forEach((video) => {
    const videoId = video.id.videoId;
    const videoLink = `https://www.youtube.com/watch?v=${videoId}`;
    const videoTitle = video.snippet.title;

    videoNameList.push(videoTitle);
    videoLinkList.push(videoLink);
    const link = createA(videoLink, videoTitle);
    const li = createElement("li");
    link.parent(li);
    li.parent(videoList);
  });
}

function updateCountData() {
  countNames = [];
  countDatas = [];

  for (let i = 0; i < videoNameList.length; i++) {
    // 모든 제목들에 대해 판단.
    let words = videoNameList[i].split(" ");
    let firstWord = words[0];

    // 기존에 있던 첫 글자와 중복된다면 counting만 한다.
    let check = false;
    for (let j = 0; j < countNames.length; j++) {
      if (countNames[j].toLowerCase() === firstWord.toLowerCase()) {
        check = true;
        countDatas[j]++;
        break;
      }
    }
    if (!check) {
      countNames.push(firstWord);
      countDatas.push(1);
    }
  }
}
function drawChart() {
  drawChartSetup();
  updateCountData();
  let total = countDatas.reduce((a, b) => a + b, 0);
  //background(220);

  let startAngle = 0;
  let endAngle = 0;

  for (let i = 0; i < countNames.length; i++) {
    // 각 항목의 비율 계산
    let ratio = countDatas[i] / total;

    // 해당 항목의 각도 계산
    let angle = map(ratio, 0, 1, 0, TWO_PI);

    // 부채꼴 그리기
    let halfLength = (height / 10) * 8;
    stroke("#222222");
    fill("#" + Math.round(Math.random() * 0xffffff).toString(16));
    stroke("#222222");
    strokeWeight(4);

    arc(
      width / 2,
      height / 2,
      halfLength,
      halfLength,
      startAngle,
      startAngle + angle
    );

    // 항목 이름과 백분율 표시
    let label = `${countNames[i]} (${nf(ratio * 100, 0, 1)}%)`;
    let labelAngle = startAngle + angle / 2;
    let labelX = width / 2 + ((cos(labelAngle) * halfLength) / 100) * 55;
    let labelY = height / 2 + ((sin(labelAngle) * halfLength) / 100) * 55;
    textAlign(CENTER, CENTER);
    noStroke();
    fill(0);
    text(label, labelX, labelY);

    // 다음 항목의 시작 각도 업데이트
    startAngle += angle;
  }
}

function draw() {}
