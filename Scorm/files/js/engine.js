import { templateEffects } from "./templates.js"
var slideMedia = []
var slideIndex = 0
var currentVideoIndex = 0

var playButtom = document.getElementById("play-buttom")
var slideBg = document.getElementById("slideBg")
var mainContainer = document.getElementById("kinetic-3")
var container30 = document.getElementById("container30")
var container31 = document.getElementById("container31")
var container32 = document.getElementById("container32")
var textBackground = document.getElementById("textBackground")
var textContainer = document.getElementById("textContainer")

var isPlaying = false
var voiceTrack = new Audio()
var soundTrack = new Audio()
var elementLesson = undefined
var selectedKinetic = 0
var kineticArray = []
var kineticTimeOut

function nextVideo() {

  console.info(currentVideoIndex)
  console.info(slideMedia)

  var videoElement = document.getElementsByClassName('videoElement')

  const currentTimeline = gsap.timeline({ defaults: { duration: 0.5 } }),
    currentVideo = videoElement[currentVideoIndex]

  const nextTimeline = gsap.timeline({ defaults: { duration: 0.5 } }),
    nextVideo = videoElement[currentVideoIndex + 1]

  nextTimeline.to(nextVideo, { scale: 0.2, duration: 0 })
  currentTimeline.to(currentVideo, { scale: 3, opacity: 0, ease: "expo.in" })
  nextTimeline.to(nextVideo, { scale: 1, ease: "expo.in" })

  if (slideMedia[currentVideoIndex].type == "video") {
    videoElement[currentVideoIndex].pause()
    if (slideMedia[currentVideoIndex + 1].type == "video") {
      videoElement[currentVideoIndex + 1].play()
    }
  }


  currentVideoIndex++
}

function hideKinetic() {
  const hideElements = (element) => {
    const timeLine = gsap.timeline({ defaults: { duration: 1 } })
    timeLine.to(element, { opacity: 0, ease: "expo.in" })
  }
  hideElements(container30)
  hideElements(container31)
  hideElements(container32)
  hideElements(textBackground)

}

function splitPhrase(phrase) {

  const phraseLength = phrase.length
  // console.info(phraseLength)
  let totalLines = Math.ceil(phraseLength / 12)
  if (totalLines > 3) {
    totalLines = 3
  }

  if (phrase.split(" ").length == 1) {
    totalLines = 1
  }

  if (phrase.split(" ").length == 2 && totalLines == 3) {
    totalLines = 2
  }

  // console.info(totalLines)
  let outArray = new Array(totalLines)
  outArray.fill("")
  // console.info(outArray)
  let phraseArray = phrase.split(" ")
  let lineCounter = 0
  // console.info(phraseArray)
  const splitCicle = () => {

    outArray[lineCounter] += phraseArray.shift()
    // console.info(outArray)
    // console.info(phraseArray)
    if (phraseArray.length > 0) {

      if ((outArray[lineCounter] + phraseArray[0]).length > phraseLength / totalLines) {
        if (lineCounter + 1 < totalLines) {
          lineCounter++
        } else {
          outArray[lineCounter] += " "
        }

      } else {
        outArray[lineCounter] += " "
      }
      splitCicle()
    }

  }
  splitCicle()
  //kineticArray = outArray
  selectedKinetic = totalLines

  return outArray
}

function showKinetic(phrase) {

  if (!phrase) {
    return
  }

  // len < 15,, weight = 800
  // len > 29 , font-family Segoe UI
  let inc1 = 0.4
  let inc2 = 0.4
  let inc3 = 0.4

  kineticArray = splitPhrase(phrase.trim())
  console.info(kineticArray)

  container30.innerHTML = kineticArray[0]


  if (kineticArray.length > 1) {
    container31.innerHTML = kineticArray[1]
  } else {
    inc2 = 0
  }

  if (kineticArray.length > 2) {
    container32.innerHTML = kineticArray[2]
  } else {
    inc3 = 0
  }

  const initializeTexts = (element) => {
    const timeLine = gsap.timeline({ defaults: { duration: 0 } })
    timeLine.to(element, { x: -800, opacity: 1 })
  }

  initializeTexts(container30)
  initializeTexts(container31)
  initializeTexts(container32)
  initializeTexts(textBackground)




  const random = Math.floor(Math.random() * selectedKinetic)
  // console.info(random)

  switch (random) {
    case 0:
      container30.style.color = 'white'
      container31.style.color = 'black'
      container32.style.color = 'black'
      break;

    case 1:
      container30.style.color = 'black'
      container31.style.color = 'white'
      container32.style.color = 'black'
      break;

    case 2:
      container30.style.color = 'black'
      container31.style.color = 'black'
      container32.style.color = 'white'
      break;

    default:
      break;
  }



  switch (selectedKinetic) {
    case 1:
      inc2 = 0
      inc3 = 0
      if (kineticArray[0].length < 15) {
        container30.style.fontWeight = 800
      } else {
        container30.style.fontWeight = 500
      }
      if (kineticArray[0].length > 29) {
        container30.style.fontFamily = "Segoe UI"
      } else {
        container30.style.fontFamily = "Azo Sans"
      }

      break;

    case 2:
      inc3 = 0

      if (kineticArray[0].length < 15) {
        container30.style.fontWeight = 800
      } else {
        container30.style.fontWeight = 500
      }
      if (kineticArray[0].length > 29) {
        container30.style.fontFamily = "Segoe UI"
      } else {
        container30.style.fontFamily = "Azo Sans"
      }

      if (kineticArray[1].length < 15) {
        container31.style.fontWeight = 800
      } else {
        container31.style.fontWeight = 500
      }
      if (kineticArray[1].length > 29) {
        container31.style.fontFamily = "Segoe UI"
      } else {
        container31.style.fontFamily = "Azo Sans"
      }
      break;

    case 3:

      if (kineticArray[0].length < 15) {
        container30.style.fontWeight = 800

      } else {
        container30.style.fontWeight = 800
      }
      if (kineticArray[0].length > 29) {
        container30.style.fontFamily = "Segoe UI"
      } else {
        container30.style.fontFamily = "Azo Sans"
      }

      if (kineticArray[1].length < 15) {
        container31.style.fontWeight = 800
      } else {
        container31.style.fontWeight = 500
      }
      if (kineticArray[1].length > 29) {
        container31.style.fontFamily = "Segoe UI"
      } else {
        container31.style.fontFamily = "Azo Sans"
      }

      if (kineticArray[2].length < 15) {
        container32.style.fontWeight = 800
      } else {
        container32.style.fontWeight = 500
      }
      if (kineticArray[2].length > 29) {
        container32.style.fontFamily = "Segoe UI"
      } else {
        container32.style.fontFamily = "Azo Sans"
      }

      break;

    default:
      break;
  }


  const mainWidth = mainContainer.offsetWidth - 6
  const mainHeight = mainContainer.offsetHeight - 6

  // console.info("mainWidth --> ", mainWidth)
  // console.info("mainHeight --> ", mainHeight)


  const sizeCycle = (fontSize1, fontSize2, fontSize3) => {

    clearTimeout(kineticTimeOut)

    container30.style.fontSize = `${fontSize1}px`
    container31.style.fontSize = `${fontSize2}px`
    container32.style.fontSize = `${fontSize3}px`

    // console.info("container30 --> ", container30.style.fontSize)
    // console.info("offsetHeights --> ", container30.offsetHeight, container31.offsetHeight, container32.offsetHeight)

    if ((container30.offsetHeight +
      container31.offsetHeight +
      container32.offsetHeight) >= mainHeight) {
      inc1 = 0
      inc2 = 0
      inc3 = 0
    }
    if (container30.offsetWidth >= mainWidth ||
      container30.offsetHeight >= mainHeight / 1.40 ||
      (container30.offsetHeight >= mainHeight / 2.50 && kineticArray[0].length < 6)) {
      inc1 = 0
    }
    if (container31.offsetWidth >= mainWidth ||
      container31.offsetHeight >= mainHeight / 1.40 ||
      (container31.offsetHeight >= mainHeight / 2.50 && kineticArray[1].length < 6)) {
      inc2 = 0
    }
    if (container32.offsetWidth >= mainWidth ||
      container32.offsetHeight >= mainHeight / 1.40 ||
      (container32.offsetHeight >= mainHeight / 2.50 && kineticArray[2].length < 6)) {
      inc3 = 0
    }
    // console.info(inc1, inc2, inc3, fontSize1, fontSize2, fontSize3)
    // console.info("container30.offsetHeight -->", container30.offsetHeight)
    if ((inc1 + inc2 + inc3) > 0) {
      sizeCycle(fontSize1 + inc1, fontSize2 + inc2, fontSize3 + inc3)
    }

  }

  setTimeout(() => {
    sizeCycle(1, 1, 1)
    const applyEffect = (element, kineticIndex) => {
      const randomEffect = Math.floor(Math.random() * (templateEffects.length - 1))
      //console.info(randomEffect)
      var split = new SplitText(element, { type: "chars,words,lines" })
      var timeLine = gsap.timeline({ defaults: { duration: 1 } })
      timeLine.to(element, { x: 0, duration: 0.5, ease: "expo.in" })
      // console.info(kineticArray[kineticIndex], kineticArray[kineticIndex].split(" ").length)
      const len = kineticArray[kineticIndex] ? kineticArray[kineticIndex].trim().split(" ").length : 0

      switch (len) {
        case 1:
          if (kineticArray[kineticIndex].length > 4) {
            var splitElement = split.words
          } else {
            var splitElement = split.chars
          }

          break;

        case 2:
          var splitElement = split.words
          break;

        default:
          var splitElement = split.lines
          break;
      }

      var currentTemplate = templateEffects[randomEffect]


      timeLine.from(splitElement, currentTemplate)
    }
    applyEffect(container30, 0)
    applyEffect(container31, 1)
    applyEffect(container32, 2)

    const textContainerWidth = textContainer.offsetWidth
    const textContainerHeight = textContainer.offsetHeight
    const textContainerTop = textContainer.offsetTop
    const textContainerLeft = textContainer.offsetLeft

    var tlBck = gsap.timeline({ defaults: { duration: 0 } }),
      textBackgroundTL = textBackground;
    tlBck.to(textBackgroundTL, { width: textContainerWidth + 20, height: textContainerHeight + 25, x: textContainerLeft - 10, y: textContainerTop - 15, ease: "expo.in", duration: 0.5 })

    kineticTimeOut = setTimeout(() => {
      hideKinetic() 
    }, 6000)

    //console.info("Size -->", textContainerWidth, textContainerHeight, textContainerTop, textContainerLeft)
  }, 200);

}

function nextKinetic(phraseIndex) {
  const phrase = elementLesson.paragraphs[slideIndex].keyPhrases[phraseIndex].toUpperCase()
  console.info(phrase)
  showKinetic(phrase)
}

function startPresentation() {
  playButtom.style.display = "none"
  if (!isPlaying) {
    soundTrack.src = "/assets/soundtracks/soundtrack1.mp3"
    soundTrack.onloadeddata = () => {
      soundTrack.volume = 0.1
      soundTrack.play()
    }
  }
  if (slideMedia[currentVideoIndex].type == "video") {
    //videoElements.get(currentVideoIndex)?.nativeElement.play()
    var videoElement = document.getElementsByClassName('videoElement')
    videoElement[currentVideoIndex].play()
  }

  isPlaying = true


  const voiceTrackUrl = elementLesson.paragraphs[slideIndex].audioUrl
  const voiceAudioScript = elementLesson?.paragraphs[slideIndex].audioScript
  const text = elementLesson?.paragraphs[slideIndex].content

  voiceTrack.src = voiceTrackUrl || ""

  voiceTrack.onloadeddata = () => {
    const voiceTrackDuration = voiceTrack.duration * 1000
    const totalPhraseWords = voiceAudioScript?.trim().length || 0
    const wordDuration = voiceTrackDuration / totalPhraseWords

    elementLesson.paragraphs[slideIndex].keyPhrases.forEach((keyPhrase, keyIndex) => {
      let phrasePosition = text.toLowerCase().indexOf(keyPhrase.toLowerCase())
      if (phrasePosition === undefined) {
        phrasePosition = -1
      }

      // console.info("text-->", text.toLowerCase())
      // console.info("keyPhrase-->", keyPhrase.toLowerCase())
      // console.info("Position of --> ", keyPhrase, phrasePosition)
      if (phrasePosition >= 0) {
        setTimeout(() => {
          nextKinetic(keyIndex)
        }, phrasePosition * wordDuration);
      }

    })

    voiceTrack.play()


  }
  voiceTrack.onended = () => {

    if (elementLesson && slideIndex < elementLesson?.paragraphs.length - 1) {
      hideKinetic()
      setTimeout(() => {
        nextVideo()
        slideIndex++
        startPresentation()
      }, 2000);
    } else {
      setTimeout(() => {
        showKinetic("Fin de la LECCIÓN")
        if (slideMedia[currentVideoIndex].type == "video") {
          videoElements.get(currentVideoIndex)?.nativeElement.pause()
        }

        setTimeout(() => {
          slideIndex = 0
          currentVideoIndex = 0
          playButtom.style.display = "block"
          soundTrack.pause()
        }, 3000);

      }, 2000);

    }

  }

}



// gsap.registerPlugin(SplitText)

let mySplitText = new SplitText(".split", { type: "chars" })
let chars = mySplitText.chars

gsap.from(chars, {
  yPercent: 130,
  stagger: 0.2,
  ease: "back.out",
  duration: 1
})

fetch('/assets/lesson.json')
  .then(response => response.json())
  .then(lessonData => {
    console.log(lessonData)
    elementLesson = lessonData
    lessonData.paragraphs.forEach((paragraph, paragraphIndex) => {
      if (paragraph.videoData.finalVideo.url != '' && paragraphIndex >= slideIndex) {
        slideMedia.push({
          url: paragraph.videoData.finalVideo.url,
          type: "video"
        })
        var newDiv = document.createElement('div')
        newDiv.innerHTML =
          `<div>
            <video class="videoElement" loop width="800" height="450"
            style="z-index:${lessonData.paragraphs.length - paragraphIndex}" >
              <source src=${paragraph.videoData.finalVideo.url} type="video/mp4">
            </video>
          </div>`

        slideBg.appendChild(newDiv)
      } else if (paragraphIndex >= slideIndex) {
        slideMedia.push({
          url: paragraph.imageData.finalImage.url,
          type: "image"
        })
        var newDiv = document.createElement('div')
        

          newDiv.innerHTML =
          `<div>
              <img class="videoElement" src=${paragraph.imageData.finalImage.url}  width="800" height="450" style="z-index:${lessonData.paragraphs.length - paragraphIndex}" >
          </div>`

        slideBg.appendChild(newDiv)
      }
    })
    console.info(slideMedia)
  })
  .catch(error => {
    console.error('Error:', error)
  })
window.addEventListener("load", function () {
  document.getElementById("play-buttom").addEventListener("click", startPresentation);
  console.info("mainContainer.offsetWidth, offsetHeight --> ", mainContainer.offsetWidth, mainContainer.offsetHeight)
})