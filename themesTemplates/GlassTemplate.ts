import { TemplateComponent } from "../CreateContent/interfaces";

type Template = TemplateComponent[];

export const GlassTemplate: Template[] = [
  // 00-00
  [
    {
      component: "meta-tag",
      code: "00-00",
      order: 2,
      description: "Slide con video vertical",
      elements: {
        media: [
          "video-v"
        ],
        title: {
          "min": 1,
          "max": 4
        },
        text: {
          "min": 1,
          "max": 30
        },
        sections: []
      }
    },
    {
      component: "audio",
      audioUrl: "[audio-url]"
    },
    {
      component: "background",
      backgroundColor: "[Primary]"
    },
    {
      component: "video",
      id: "video1",
      video: "[video-v]",
      height: "90%",
      top: "5%",
      right: "20%",
      layer: 6,
      display: true
    },
    {
      component: "img",
      id: "img1",
      image: "[image-v]",
      height: "90%",
      top: "5%",
      right: "20%",
      layer: 1,
      display: true
    },
    {
      component: "svg",
      id: "svg1",
      image: "./assets/glass_objects/circle.svg",
      height: "40%",
      top: "32%",
      right: "1%",
      layer: 4,
      display: true
    },
    {
      component: "svg",
      id: "svg2",
      image: "./assets/glass_objects/circle.svg",
      height: "30%",
      top: "-2%",
      right: "90%",
      layer: 4,
      display: true
    },
    {
      component: "svg",
      id: "svg3",
      image: "./assets/glass_objects/glassObj1.svg",
      height: "30%",
      top: "66%",
      right: "78%",
      rotate: "-120deg",
      layer: 4,
      display: true
    },
    {
      component: "card",
      id: "card1",
      width: "35%",
      height: "104%",
      top: "-2%",
      right: "-1%",
      layer: 3,
      bgColor: "[Secondary]",
      extraClasses: "glass-12-wbg",
      display: true
    },
    {
      component: "card",
      id: "card3",
      width: "12%",
      height: "104%",
      bgColor: "#ffffff00",
      top: "-2%",
      right: "4%",
      layer: 5,
      extraClasses: "glass-12-wbg",
      display: true
    },
    {
      component: "card",
      id: "card2",
      width: "52%",
      height: "70%",
      top: "15%",
      right: "45%",
      padding: "3cqw",
      title: "[title]",
      titleFontSize: 5,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 2.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "2cqw",
      layer: 7,
      extraClasses: "glass justify-center",
      display: true
    }
  ],
  // 00-01 ✅
  [
    {
      component: "meta-tag",
      code: "00-01",
      order: 4,
      description: "Slide con un asset de fondo",
      elements: {
        media: ["image-h"],
        title: {
          min: 2,
          max:6,
        },
        text: {
          min: 20,
          max: 40,
        },
        sections: [],
      },
    },
    {
      component: "audio",
      audioUrl: "[audio-url]",
    },
    {
      component: "background",
      backgroundColor: "[Primary]",
    },
    {
      component: "img",
      id: "img1",
      image: "[image-h]",
      width: "100%",
      height: "100%",
      top: "0%",
      right: "0%",
      layer: 2,
      display: true,
    },
    {
      component: "video",
      id: "video1",
      video: "[video-h]",
      width: "100%",
      height: "100%",
      top: "0%",
      right: "0%",
      layer: 2,
      display: true
    },
    {
      component: "card",
      id: "card1",
      extraClasses: "p-6 glass justify-center",
      width: "40%",
      height: "104%",
      top: "-2%",
      right: "30%",
      bottom: "5%",
      padding: "3cqw",
      title: "[title]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "#ffffff",
      text: "[text]",
      textFontSize: 1.8,
      textFontColor: "#ffffff",
      textMarginTop: "1cqw",
      icon: "[icon-b]",
      iconPosition: "absolute",
      layer: 3,
      display: true,
    },
    {
      component: "svg",
      id: "svg1",
      image: "./assets/glass_objects/glassObj1.svg",
      height: "50%",
      top: "1%",
      right: "-13%",
      rotate: "100deg",
      layer: 4,
      display: true
    },
    {
      component: "svg",
      id: "svg2",
      image: "./assets/glass_objects/circle.svg",
      height: "40%",
      top: "75%",
      right: "55%",
      layer: 4,
      display: true
    },
    {
      component: "svg",
      id: "svg3",
      image: "./assets/glass_objects/circle.svg",
      height: "20%",
      top: "75%",
      right: "50%",
      layer: 4,
      display: true
    }
  ],
  // 00-02
  [
    {
      component: "meta-tag",
      code: "00-02",
      order: 3,
      description: "Slide con video cuadrado/vertical, Texto a la derecha o izquierda.",
      elements: {
        media: [
          "video-v"
        ],
        title: {
          "min": 2,
          "max": 8
        },
        text: {
          "min": 5,
          "max": 50
        },
        sections: []
      }
    },
    {
      component: "audio",
      audioUrl: "[audio-url]"
    },
    {
      component: "mediaWithVMirror",
      video: "[video-v]",
      image: "[image-q]",
      rightOrLeft: "right",
      layer: 1,
      title: "[title]",
      titleFontSize: 5,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 2.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "2cqw",
      fontFamily: "Fira Sans",
      display: true
    }
  ],
  // 00-03
  [
    {
      component: "meta-tag",
      code: "00-03",
      order: 1,
      description: "Portada del curso",
      elements: {
        media: [
          "icon-b",
          "video-h"
        ],
        title: {
          "min": 1,
          "max": 4
        },
        text: {
          "min": 1,
          "max": 14
        },
        sections: []
      }
    },
    {
      component: "audio",
      audioUrl: "[audio-url]"
    },
    {
      component: "card",
      id: "card1",
      width: "100%",
      height: "50%",
      top: "25%",
      padding: "6cqw",
      extraClasses: "glass justify-center",
      icon: "[icon-b]",
      iconPosition: "absolute",
      iconHeight: "30%",
      iconRight: "4%",
      title: "[title]",
      titleFontSize: 6,
      titleFontColor: "#ffffff",
      titleLineHeight: 1,
      text: "[text]",
      textFontSize: 3.5,
      textFontColor: "#ffffff",
      textExtraClasses: "",
      textMarginTop: "1cqw",
      layer: 3,
      display: true
    },
    {
      component: "video",
      video: "[video-h]",
      width: "100%",
      height: "100%",
      layer: 1,
      display: true
    },
    {
      component: "img",
      image: "[image-h]",
      width: "100%",
      height: "100%",
      layer: 1,
      display: true
    }
  ],
  // 00-04 ✅
  [
    {
      component: "meta-tag",
      code: "00-04",
      order: 5,
      description: "Slide con un asset cuadrado a la izquierda",
      elements: {
        media: ["image-q"],
        title: {
          min: 1,
          max: 14,
        },
        text: {
          min: 20,
          max: 50,
        },
        sections: [],
      },
    },
    {
      component: "audio",
      audioUrl: "[audio-url]",
    },
    {
      component: "background",
      backgroundColor: "[Primary]",
    },
    {
      component: "img",
      id: "img1",
      image: "[image-q]",
      width: "50%",
      height: "100%",
      top: "0%",
      right: "50%",
      layer: 2,
      display: true,
    },
    {
      component: "video",
      id: "vid1",
      video: "[video-h]",
      width: "50%",
      height: "100%",
      top: "0%",
      right: "50%",
      layer: 2,
      display: true,
    },
    {
      component: "card",
      id: "card1",
      extraClasses: "p-6 card-centered glass",
      width: "50%",
      right: "8%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "3cqw",
      title: "[title]",
      titleFontSize: 3,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 2,
      textFontColor: "[PrimaryText]",
      textMarginTop: "2cqw",
      layer: 3,
      display: true,
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "35%",
      right: "-10%",
      layer: 1,
      display: true,
    }
  ],
  // 00-FULL
  [
    {
      component: "meta-tag",
      code: "00-FULL",
      description: "Portada del curso",
      elements: {
        media: [
          "video-h"
        ],
        title: {
          "min": 0,
          "max": 0
        },
        text: {
          "min": 0,
          "max": 0
        },
        sections: []
      }
    },
    {
      component: "audio",
      audioUrl: "[audio-url]"
    },

    {
      component: "video",
      id: "video1",
      video: "[video-h]",
      width: "100%",
      height: "100%",
      layer: 1,
      display: true
    },
    {
      component: "img",
      id: "img1",
      image: "[image-h]",
      width: "100%",
      height: "100%",
      layer: 1,
      display: true
    }
  ],
  // 01-00
  [
    {
      component: "meta-tag",
      code: "01-00",
      order: 6,
      description: "Slide con video Vertical",
      elements: {
        media: [
          "video-h",
          "icon-b"
        ],
        title: {
          "min": 1,
          "max": 4
        },
        text: {
          "min": 1,
          "max": 20
        },
        sections: [
          {
            title: {
              "min": 1,
              "max": 8
            },
            text: {
              "min": 1,
              "max": 40
            }
          }
        ]
      }
    },
    {
      component: "audio",
      audioUrl: "[audio-url]"
    },
    {
      component: "mediaWithMirror",
      video: "[video-h]",
      image: "[image-h]",
      layer: 1,
      title: "[title]",
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 2.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "2cqw",
      fontFamily: "Fira Sans",
      display: true
    },
    {
      component: "card",
      id: "card1",
      extraClasses: "p-6 card-centered max-h-80 min-h-30",
      width: "25%",
      right: "4%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "1cqw",
      icon: "[icon-b]",
      iconWidth: "clamp(40px, 30%, 30%)",
      iconMargingRight: "4%",
      title: "[sections.0.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true
    },
    {
      component: "card",
      id: "card2",
      width: "25%",
      height: "100%",
      right: "0",
      bgColor: "[Primary]",
      position: "relative",
      alignment: "flex items-center justify-center",
      layer: 2,
      display: true
    }
  ],
  // 01-01 ✅
  [
    {
      component: "meta-tag",
      code: "01-01",
      order: 8,
      description: "Slide con un asset vertical a la izquierda",
      elements: {
        media: ["video-v"],
        title: {
          min: 1,
          max: 8,
        },
        text: {
          min: 15,
          max: 30,
        },
        sections: [
          {
            title: {
              min: 1,
              max: 12,
            },
            text: {
              min: 20,
              max: 40,
            },
          },
        ],
      },
    },
    {
      component: "audio",
      audioUrl: "[audio-url]",
    },
    {
      component: "background",
      backgroundColor: "[Primary]",
    },
    {
      component: "video",
      id: "vid1",
      video: "[video-v]",
      width: "35%",
      height: "90%",
      top: "5%",
      right: "60%",
      layer: 2,
      display: true,
    },
    {
      component: "img",
      id: "img1",
      image: "[image-v]",
      width: "35%",
      height: "90%",
      top: "5%",
      right: "60%",
      layer: 2,
      display: true,
    },
    {
      component: "card",
      id: "card1",
      width: "50%",
      height: "40%",
      right: "5%",
      top: "5%",
      title: "[title]",
      titleFontSize: 3,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 2,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1.8cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card2",
      extraClasses: "p-6 glass min-h-35 max-h-50",
      width: "50%",
      right: "5%",
      bottom: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2.5cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 2.1,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      textMarginTop: "2cqw",
      layer: 3,
      display: true,
    },
    {
      component: "star",
      id: "star1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "10%",
      right: "87%",
      layer: 1,
      display: true,
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "82%",
      right: "3%",
      layer: 1,
      display: true,
    },
  ],
  // 01-02 ✅ 
  [
    {
      component: "meta-tag",
      code: "01-02",
      order: 7,
      description: "Slide con dos assets",
      elements: {
        media: ["image-h", "image-h"],
        title: {
          min: 1,
          max: 10,
        },
        text: {
          min: 20,
          max: 30,
        },
        sections: [
          {
            title: {
              min: 1,
              max: 10,
            },
            text: {
              min: 20,
              max: 30,
            },
          },
        ],
      },
    },
    {
      component: "audio",
      audioUrl: "[audio-url]",
    },
    {
      component: "background",
      backgroundColor: "[Primary]",
    },
    {
      component: "img",
      id: "img1",
      image: "[image-h]",
      width: "42%",
      height: "45%",
      top: "5%",
      right: "5%",
      layer: 2,
      display: true,
    },
    {
      component: "img",
      id: "img2",
      image: "[image-h]",
      width: "42%",
      height: "45%",
      top: "50%",
      right: "53%",
      layer: 2,
      display: true,
    },
    {
      component: "card",
      id: "card1",
      extraClasses: "p-6",
      width: "42%",
      height: "40%",
      right: "53%",
      top: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[title]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1.5cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card2",
      extraClasses: "p-6 glass",
      width: "42%",
      height: "40%",
      right: "5%",
      top: "55%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1.5cqw",
      layer: 3,
      display: true,
    },
    {
      component: "star",
      id: "star1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "66%",
      right: "-1%",
      layer: 1,
      display: true,
    },
  ],
  // 01-03 ✅
  [
    {
      component: "meta-tag",
      code: "01-03",
      order: 10,
      description: "Slide con dos assets",
      elements: {
        media: ["image-h", "image-h"],
        title: {
          min: 1,
          max: 12,
        },
        text: {
          min: 30,
          max: 50,
        },
        sections: [
          {
            title: {
              min: 1,
              max: 12,
            },
            text: {
              min: 30,
              max: 40,
            },
          },
        ],
      },
    },
    {
      component: "audio",
      audioUrl: "[audio-url]",
    },
    {
      component: "background",
      backgroundColor: "[Primary]",
    },
    {
      component: "img",
      id: "img1",
      image: "[image-h]",
      width: "35%",
      height: "40%",
      top: "5%",
      right: "60%",
      layer: 2,
      display: true,
    },
    {
      component: "img",
      id: "img2",
      image: "[image-h]",
      width: "35%",
      height: "40%",
      top: "50%",
      right: "5%",
      layer: 2,
      display: true,
    },
    {
      component: "card",
      id: "card1",
      extraClasses: "p-6 glass",
      width: "50%",
      height: "40%",
      right: "5%",
      top: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[title]",
      titleFontSize: 2.1,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card2",
      extraClasses: "p-6 glass",
      width: "50%",
      height: "40%",
      right: "45%",
      top: "50%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 2.1,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "star",
      id: "star1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "40%",
      height: "40%",
      top: "80%",
      right: "67%",
      layer: 1,
      display: true,
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "-18%",
      right: "3%",
      layer: 1,
      display: true,
    },
  ],
  // 01-04 ✅
  [
    {
      component: "meta-tag",
      code: "01-04",
      order: 9,
      description: "Slide con un asset que ocupa todo el ancho",
      elements: {
        media: ["image-h"],
        title: {
          min: 1,
          max: 10,
        },
        text: {
          min: 10,
          max: 30,
        },
        sections: [
          {
            title: {
              min: 1,
              max: 10,
            },
            text: {
              min: 10,
              max: 30,
            },
          },
        ],
      },
    },
    {
      component: "audio",
      audioUrl: "[audio-url]",
    },
    {
      component: "background",
      backgroundColor: "[Primary]",
    },
    {
      component: "img",
      id: "img1",
      image: "[image-h]",
      width: "90%",
      height: "50%",
      top: "5%",
      right: "5%",
      layer: 2,
      display: true,
    },
    {
      component: "card",
      id: "card1",
      extraClasses: "p-6 glass",
      width: "44%",
      height: "35%",
      right: "51%",
      top: "60%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[title]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card2",
      extraClasses: "p-6 glass",
      width: "44%",
      height: "35%",
      right: "5%",
      top: "60%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "86%",
      right: "67%",
      layer: 1,
      display: true,
    },
  ],
  // 01-05
  [
    {
      component: "meta-tag",
      code: "01-05",
      order: 11,
      description: "Slide sin fotos ni video",
      elements: {
        media: [],
        title: {
          "min": 2,
          "max": 15
        },
        text: {
          "min": 5,
          "max": 60
        },
        sections: [
          {
            title: {
              "min": 1,
              "max": 8
            },
            text: {
              "min": 1,
              "max": 50
            }
          }
        ]
      }
    },
    {
      component: "audio",
      audioUrl: "[audio-url]"
    },
    {
      component: "background",
      backgroundColor: "[Primary]"
    },
    {
      component: "card",
      id: "card1",
      width: "50%",
      height: "100%",
      padding: "5cqw",
      bgColor: "[Secondary]",
      title: "[title]",
      titleFontSize: 3.5,
      titleFontColor: "[SecondaryText]",
      titleFontWeight: "200",
      text: "[text]",
      textMarginTop: "1cqw",
      textFontSize: 2,
      textFontColor: "[SecondaryText]",
      layer: 5,
      extraClasses: "glass-12-sb justify-center",
      display: true
    },
    {
      component: "card",
      id: "card2",
      width: "50%",
      right: "0",
      padding: "2cqw",
      layer: 5,
      extraClasses: "glass",
      display: true
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "45%",
      height: "45%",
      top: "60%",
      right: "-18%",
      layer: 6,
      display: true
    },
    {
      component: "card",
      id: "card3",
      top: "30%",
      right: "5%",
      width: "48%",
      height: "40%",
      extraClasses: "glass justify-center",
      padding: "2cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 2.2,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.7,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 7,
      display: true
    },

    {
      component: "star",
      id: "star1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "40%",
      height: "40%",
      top: "12%",
      right: "68%",
      layer: 1,
      display: true
    },
    {
      component: "circle",
      id: "circle2",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "85%",
      right: "36%",
      layer: 3,
      display: true
    },
    {
      component: "circle",
      id: "circle3",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "-15%",
      right: "-15%",
      layer: 3,
      display: true
    }
  ],
  // 02-00
  [
    {
      component: "meta-tag",
      code: "02-00",
      order: 14,
      description: "Slide con una imagen cuadrada",
      elements: {
        media: [
          "icon-b",
          "icon-b",
          "image-q"
        ],
        title: {
          "min": 3,
          "max": 10
        },
        text: {
          "min": 1,
          "max": 30
        },
        sections: [
          {
            title: {
              "min": 1,
              "max": 3
            },
            text: {
              "min": 1,
              "max": 25
            }
          },
          {
            title: {
              "min": 1,
              "max": 3
            },
            text: {
              "min": 1,
              "max": 25
            }
          }
        ]
      }
    },
    {
      component: "audio",
      audioUrl: "[audio-url]"
    },
    {
      component: "background",
      backgroundColor: "[Primary]"
    },
    {
      component: "card",
      id: "card1",
      width: "50%",
      height: "80%",
      padding: "2cqw",
      title: "[title]",
      titleFontSize: 3.5,
      titleFontColor: "[PrimaryText]",
      titleFontWeight: "200",
      text: "[text]",
      textMarginTop: "1cqw",
      textFontSize: 2,
      textFontColor: "[PrimaryText]",
      layer: 5,
      extraClasses: "glass justify-center",
      display: true
    },
    {
      component: "card",
      id: "card2",
      top: "80%",
      width: "50%",
      height: "20%",
      bgColor: "[Secondary]",
      extraClasses: "glass-12-sb justify-center",
      padding: "1cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 1.8,
      titleFontColor: "[SecondaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.4,
      textMarginTop: "1cqw",
      textFontColor: "[SecondaryText]",
      icon: "[icon-b]",
      iconWidth: "clamp(30px, 3%, 3%)",
      iconMargingRight: "0.5cqw",
      layer: 4,
      display: true
    },
    {
      component: "card",
      id: "card3",
      right: "0px",
      top: "80%",
      width: "50%",
      height: "20%",
      bgColor: "[Primary]",
      extraClasses: "glass justify-center",
      padding: "1cqw",
      title: "[sections.1.subtitle]",
      titleFontSize: 1.8,
      titleFontColor: "[PrimaryText]",
      text: "[sections.1.text]",
      textFontSize: 1.4,
      textMarginTop: "1cqw",
      textFontColor: "[PrimaryText]",
      icon: "[icon-b]",
      iconWidth: "clamp(30px, 3%, 3%)",
      iconMargingRight: "0.5cqw",
      layer: 4,
      display: true
    },
    {
      component: "img",
      id: "img1",
      image: "[image-q]",
      width: "50%",
      height: "80%",
      right: "0px",
      layer: 6,
      display: true
    },
    {
      component: "video",
      id: "video1",
      video: "[video-h]",
      width: "50%",
      height: "80%",
      right: "0px",
      layer: 6,
      display: true
    },
    {
      component: "star",
      id: "star1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "40%",
      height: "40%",
      top: "12%",
      right: "68%",
      layer: 1,
      display: true
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "85%",
      right: "36%",
      layer: 3,
      display: true
    }
  ],
  // 02-01
  [
    {
      component: "meta-tag",
      code: "02-01",
      order: 12,
      description: "Slide con 2 fotos cuadradas y 1 video vertical",
      elements: {
        media: [
          "video-v",
          "image-q",
          "image-q"
        ],
        title: {
          "min": 1,
          "max": 8
        },
        text: {
          "min": 1,
          "max": 45
        },
        sections: [
          {
            title: {
              "min": 1,
              "max": 3
            },
            text: {
              "min": 1,
              "max": 20
            }
          },
          {
            title: {
              "min": 1,
              "max": 3
            },
            text: {
              "min": 1,
              "max": 25
            }
          }
        ]
      }
    },
    {
      component: "audio",
      audioUrl: "[audio-url]"
    },
    {
      component: "card",
      id: "card1",
      width: "70%",
      height: "30%",
      right: "0",
      top: "35%",
      layer: 4,
      extraClasses: "glass justify-center",
      display: true
    },
    {
      component: "card",
      id: "card2",
      width: "40%",
      height: "100%",
      right: "0",
      bgColor: "[Primary]",
      layer: 2,
      display: true
    },
    {
      component: "card",
      id: "card3",
      title: "[title]",
      titleFontSize: 3.5,
      titleFontColor: "[PrimaryText]",
      width: "32%",
      height: "30%",
      right: "5%",
      top: "4.5%",
      extraClasses: "justify-center",
      layer: 5,
      display: true
    },
    {
      component: "card",
      id: "card4",
      text: "[text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      width: "32%",
      height: "25%",
      right: "5%",
      top: "72%",
      layer: 5,
      display: true
    },
    {
      component: "card",
      id: "card5",
      extraClasses: "justify-center",
      title: "[sections.0.subtitle]",
      titleFontSize: 2.2,
      titleFontColor: "#ffffff",
      text: "[sections.0.text]",
      textFontSize: 1.6,
      textFontColor: "#ffffff",
      textMarginTop: "0.5cqw",
      width: "25%",
      height: "25%",
      right: "42%",
      top: "39%",
      layer: 5,
      display: true
    },
    {
      component: "card",
      id: "card6",
      title: "[sections.1.subtitle]",
      extraClasses: "justify-center",
      titleFontSize: 2.2,
      titleFontColor: "[PrimaryText]",
      text: "[sections.1.text]",
      textFontSize: 1.6,
      textFontColor: "[PrimaryText]",
      textMarginTop: "0.5cqw",
      width: "32%",
      height: "25%",
      right: "5%",
      top: "39%",
      layer: 5,
      display: true
    },
    {
      component: "video",
      id: "video1",
      video: "[video-v]",
      width: "30%",
      height: "100%",
      right: "40%",
      layer: 1,
      display: true
    },
    {
      component: "img",
      id: "img1",
      image: "[image-q]",
      width: "30%",
      height: "50%",
      layer: 1,
      display: true
    },
    {
      component: "img",
      id: "img2",
      image: "[image-q]",
      width: "30%",
      height: "50%",
      top: "50%",
      layer: 1,
      display: true
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "50%",
      right: "-15%",
      layer: 3,
      display: true
    }
  ],
  // 02-02
  [
    {
      component: "meta-tag",
      code: "02-02",
      order: 13,
      description: "Slide sin fotos ni videos",
      elements: {
        media: [
          "icon-w",
          "icon-w"
        ],
        title: {
          "min": 1,
          "max": 15
        },
        text: {
          "min": 1,
          "max": 50
        },
        sections: [
          {
            title: {
              "min": 1,
              "max": 4
            },
            text: {
              "min": 1,
              "max": 30
            }
          },
          {
            title: {
              "min": 1,
              "max": 4
            },
            text: {
              "min": 1,
              "max": 30
            }
          }
        ]
      }
    },
    {
      component: "audio",
      audioUrl: "[audio-url]"
    },
    {
      component: "background",
      backgroundColor: "[Primary]"
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      height: "40%",
      top: "47%",
      right: "3%",
      layer: 2,
      display: true
    },
    {
      component: "card",
      id: "card1",
      width: "35%",
      height: "100%",
      right: "15%",
      layer: 3,
      extraClasses: "glass",
      display: true
    },
    {
      component: "iconRL",
      id: "iconRL1",
      icon: "[icon-w]",
      width: "33%",
      height: "8%",
      top: "10%",
      right: "16%",
      layer: 4,
      display: true
    },
    {
      component: "iconRL",
      id: "iconRL2",
      icon: "[icon-w]",
      width: "33%",
      height: "8%",
      top: "53%",
      right: "16%",
      layer: 4,
      display: true
    },
    {
      component: "card",
      id: "card2",
      extraClasses: "justify-center",
      title: "[title]",
      titleFontSize: 3,
      titleFontColor: "[PrimaryText]",
      titleLineHeight: 1.1,
      text: "[text]",
      textFontSize: 2,
      textFontColor: "[PrimaryText]",
      textFontWeight: "200",
      textMarginTop: "1.5cqw",
      width: "40%",
      height: "90%",
      right: "55%",
      top: "8%",
      layer: 4,
      display: true
    },
    {
      component: "card",
      id: "card3",
      width: "30%",
      height: "60%",
      right: "16%",
      top: "20%",
      title: "[sections.0.subtitle]",
      titleFontSize: 1.5,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.3,
      textFontColor: "[PrimaryText]",
      textMarginTop: "0.8cqw",
      layer: 4,
      display: true
    },
    {
      component: "card",
      id: "card4",
      extraClasses: "",
      width: "30%",
      height: "60%",
      right: "16%",
      top: "63%",
      title: "[sections.1.subtitle]",
      titleFontSize: 1.5,
      titleFontColor: "[PrimaryText]",
      text: "[sections.1.text]",
      textFontSize: 1.3,
      textFontColor: "[PrimaryText]",
      textMarginTop: "0.8cqw",
      layer: 4,
      display: true
    }
  ],
  // 02-03 ✅
  [
    {
      component: "meta-tag",
      code: "02-03",
      order: 15,
      description:
        "Slide con asset horizontal en la esquina inferior izquierda",
      elements: {
        media: ["image-h"],
        title: {
          min: 1,
          max: 10,
        },
        text: {
          min: 10,
          max: 30,
        },
        sections: [
          {
            title: {
              min: 1,
              max: 10,
            },
            text: {
              min: 10,
              max: 30,
            },
          },
          {
            title: {
              min: 1,
              max: 12,
            },
            text: {
              min: 10,
              max: 33,
            },
          },
        ],
      },
    },
    {
      component: "audio",
      audioUrl: "[audio-url]",
    },
    {
      component: "background",
      backgroundColor: "[Primary]",
    },
    {
      component: "img",
      id: "img1",
      image: "[image-h]",
      width: "945",
      height: "45%",
      top: "48%",
      right: "50%",
      layer: 2,
      display: true,
    },
    {
      component: "video",
      id: "video1",
      video: "[video-h]",
      width: "945",
      height: "45%",
      top: "48%",
      right: "50%",
      layer: 2,
      display: true,
    },
    {
      component: "card",
      id: "card1",
      extraClasses: "p-6 glass",
      width: "45%",
      height: "38%",
      right: "50%",
      top: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[title]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card2",
      extraClasses: "p-6 glass",
      width: "40%",
      height: "38%",
      right: "5%",
      top: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card3",
      extraClasses: "p-6 glass",
      width: "40%",
      height: "45%",
      top: "48%",
      right: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.1.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.1.text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      height: "40%",
      top: "-18%",
      right: "-10%",
      layer: 1,
      display: true,
    },
  ],
  // 02-04 ✅
  [
    {
      component: "meta-tag",
      code: "02-04",
      order: 16,
      description: "Slide con un asset vertical a la derecha",
      elements: {
        media: ["video-v"],
        title: {
          min: 1,
          max: 12,
        },
        text: {
          min: 20,
          max: 30,
        },
        sections: [
          {
            title: {
              min: 1,
              max: 12,
            },
            text: {
              min: 20,
              max: 30,
            },
          },
          {
            title: {
              min: 1,
              max: 12,
            },
            text: {
              min: 20,
              max: 30,
            },
          },
        ],
      },
    },
    {
      component: "audio",
      audioUrl: "[audio-url]",
    },
    {
      component: "background",
      backgroundColor: "[Primary]",
    },
    {
      component: "video",
      id: "vid1",
      video: "[video-v]",
      width: "35%",
      height: "90%",
      top: "5%",
      right: "5%",
      layer: 2,
      display: true,
    },
    {
      component: "img",
      id: "img1",
      image: "[image-v]",
      width: "35%",
      height: "90%",
      top: "5%",
      right: "5%",
      layer: 2,
      display: true,
    },
    {
      component: "card",
      id: "card1",
      extraClasses: "p-6",
      width: "50%",
      height: "28%",
      right: "45%",
      top: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[title]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card2",
      extraClasses: "p-6 glass",
      width: "50%",
      height: "28%",
      right: "45%",
      top: "36%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card3",
      extraClasses: "p-6 glass",
      width: "50%",
      height: "28%",
      right: "45%",
      top: "67%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.1.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.1.text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "star",
      id: "star1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "51%",
      right: "33%",
      layer: 1,
      display: true,
    },
  ],
  // 03-00
  [
    {
      component: "meta-tag",
      code: "03-00",
      order: 17,
      description: "Slide sin Fotos ni Videos",
      elements: {
        media: [
          "icon-b",
          "icon-b",
          "icon-b"
        ],
        title: {
          "min": 1,
          "max": 20
        },
        text: {
          "min": 1,
          "max": 40
        },
        sections: [
          {
            title: {
              "min": 1,
              "max": 4
            },
            text: {
              "min": 1,
              "max": 20
            }
          },
          {
            title: {
              "min": 1,
              "max": 4
            },
            text: {
              "min": 1,
              "max": 20
            }
          },
          {
            title: {
              "min": 1,
              "max": 4
            },
            text: {
              "min": 1,
              "max": 20
            }
          }
        ]
      }
    },
    {
      component: "audio",
      audioUrl: "[audio-url]"
    },
    {
      component: "background",
      backgroundColor: "[Primary]"
    },
    {
      component: "card",
      id: "card2",
      bgColor: "[FinalObject]",
      width: "50%",
      height: "5%",
      right: "0",
      top: "0",
      layer: 4,
      display: true
    },
    {
      component: "card",
      id: "card3",
      width: "50%",
      height: "100%",
      top: "0",
      right: "50%",
      padding: "6cqw",
      bgColor: "[Primary]",
      extraClasses: "justify-center",
      title: "[title]",
      titleFontFamily: "Fira Sans",
      titleFontWeight: "500",
      titleFontSize: 3,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      textFontWeight: "200",
      textMarginTop: "1.5cqw",
      layer: 4,
      display: true
    },
    {
      component: "iconRT",
      id: "iconRT1",
      icon: "[icon-b]",
      width: "45%",
      top: "10%",
      right: "3%",
      circleColor: "#ffffff55",
      title: "[sections.0.subtitle]",
      titleFontFamily: "Fira Sans",
      titleFontWeight: "500",
      titleFontSize: 2,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      layer: 3,
      display: true
    },
    {
      component: "iconRT",
      id: "iconRT2",
      icon: "[icon-b]",
      width: "45%",
      top: "41%",
      right: "3%",
      circleColor: "#ffffff55",
      title: "[sections.1.subtitle]",
      titleFontFamily: "Fira Sans",
      titleFontWeight: "500",
      titleFontSize: 2,
      titleFontColor: "[PrimaryText]",
      text: "[sections.1.text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      layer: 3,
      display: true
    },
    {
      component: "iconRT",
      id: "iconRT3",
      icon: "[icon-b]",
      width: "45%",
      top: "72%",
      right: "3%",
      circleColor: "#ffffff55",
      title: "[sections.2.subtitle]",
      titleFontFamily: "Fira Sans",
      titleFontWeight: "500",
      titleFontSize: 2,
      titleFontColor: "[PrimaryText]",
      text: "[sections.2.text]",
      textFontSize: 1.8,
      textFontColor: "[PrimaryText]",
      layer: 3,
      display: true
    },
    {
      component: "card",
      id: "card1",
      width: "50%",
      height: "100%",
      right: "0",
      layer: 2,
      extraClasses: "glass",
      display: true
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "70%",
      right: "35%",
      layer: 1,
      display: true
    }
  ],
  // 03-01
  [
    {
      component: "meta-tag",
      code: "03-01",
      order: 20,
      description: "Slide con tres imágenes horizontales",
      elements: {
        media: [
          "image-h",
          "image-h",
          "image-h"
        ],
        title: {
          "min": 1,
          "max": 8
        },
        text: {
          "min": 1,
          "max": 40
        },
        sections: [
          {
            title: {
              "min": 1,
              "max": 7
            },
            text: {
              "min": 1,
              "max": 30
            }
          },
          {
            title: {
              "min": 1,
              "max": 7
            },
            text: {
              "min": 1,
              "max": 30
            }
          },
          {
            title: {
              "min": 1,
              "max": 7
            },
            text: {
              "min": 1,
              "max": 30
            }
          }
        ]
      }
    },
    {
      component: "audio",
      audioUrl: "[audio-url]"
    },
    {
      component: "background",
      backgroundColor: "[Primary]"
    },
    {
      component: "card",
      id: "card4",
      title: "[title]",
      titleFontSize: 3,
      titleFontColor: "[PrimaryText]",
      titleLineHeight: 1.1,
      width: "30%",
      height: "20%",
      right: "65%",
      top: "5%",
      layer: 4,
      display: true
    },
    {
      component: "card",
      id: "card2",
      text: "[text]",
      textFontSize: 2,
      textFontColor: "[PrimaryText]",
      textFontWeight: "200",
      width: "55%",
      height: "20%",
      right: "5.3%",
      top: "5%",
      layer: 4,
      display: true
    },
    {
      component: "img",
      id: "img1",
      image: "[image-h]",
      width: "28%",
      height: "28%",
      top: "34%",
      right: "66.6%",
      imgExtraClasses: "rounded-top",
      layer: 8,
      display: true
    },
    {
      component: "img",
      id: "img2",
      image: "[image-h]",
      width: "28%",
      height: "28%",
      top: "34%",
      right: "35.95%",
      imgExtraClasses: "rounded-top",
      layer: 8,
      display: true
    },
    {
      component: "img",
      id: "img3",
      image: "[image-h]",
      width: "28%",
      height: "28%",
      top: "34%",
      right: "5.3%",
      imgExtraClasses: "rounded-top",
      layer: 8,
      display: true
    },
    {
      component: "card",
      id: "card1",
      top: "62%",
      right: "66.6%",
      width: "28%",
      height: "30%",
      extraClasses: "glass justify-top",
      padding: "1cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 1.6,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.4,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 4,
      display: true
    },
    {
      component: "card",
      id: "card2",
      top: "62%",
      right: "35.95%",
      width: "28%",
      height: "30%",
      extraClasses: "glass justify-top",
      padding: "1cqw",
      title: "[sections.1.subtitle]",
      titleFontSize: 1.6,
      titleFontColor: "[PrimaryText]",
      text: "[sections.1.text]",
      textFontSize: 1.4,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 4,
      display: true
    },
    {
      component: "card",
      id: "card3",
      top: "62%",
      right: "5.3%",
      width: "28%",
      height: "30%",
      extraClasses: "glass justify-top",
      padding: "1cqw",
      title: "[sections.2.subtitle]",
      titleFontSize: 1.6,
      titleFontColor: "[PrimaryText]",
      text: "[sections.2.text]",
      textFontSize: 1.4,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 4,
      display: true
    },
    {
      component: "star",
      id: "star1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "60%",
      height: "60%",
      top: "30%",
      right: "70%",
      layer: 1,
      display: true
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "85%",
      right: "20%",
      layer: 3,
      display: true
    }
  ],
  // 03-02 ✅
  [
    {
      component: "meta-tag",
      code: "03-02",
      order: 19,
      description: "Slide sin assets",
      elements: {
        media: [],
        title: {
          min: 1,
          max: 15,
        },
        text: {
          min: 30,
          max: 50,
        },
        sections: [
          {
            title: {
              min: 1,
              max: 15,
            },
            text: {
              min: 30,
              max: 50,
            },
          },
          {
            title: {
              min: 1,
              max: 15,
            },
            text: {
              min: 30,
              max: 50,
            },
          },
          {
            title: {
              min: 1,
              max: 15,
            },
            text: {
              min: 30,
              max: 50,
            },
          },
        ],
      },
    },
    {
      component: "audio",
      audioUrl: "[audio-url]",
    },
    {
      component: "background",
      backgroundColor: "[Primary]",
    },
    {
      component: "card",
      id: "card1",
      extraClasses: "p-6",
      width: "44%",
      height: "42%",
      right: "51%",
      top: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[title]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card2",
      extraClasses: "p-6 glass",
      width: "44%",
      height: "42%",
      right: "5%",
      top: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card3",
      extraClasses: "p-6 glass",
      width: "44%",
      height: "42%",
      right: "51%",
      top: "51%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.1.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.1.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card4",
      extraClasses: "p-6 glass",
      width: "44%",
      height: "42%",
      right: "5%",
      top: "51%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.2.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.2.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "star",
      id: "star1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "20%",
      right: "87%",
      layer: 1,
      display: true,
    },
  ],
  // 03-03 ✅
  [
    {
      component: "meta-tag",
      code: "03-03",
      order: 21,
      description: "Slide con asset cuadrado en la esquina superior izquierda",
      elements: {
        media: ["image-q"],
        title: {
          min: 1,
          max: 7,
        },
        text: {
          min: 5,
          max: 25,
        },
        sections: [
          {
            title: {
              min: 1,
              max: 7,
            },
            text: {
              min: 5,
              max: 25,
            },
          },
          {
            title: {
              min: 1,
              max: 12,
            },
            text: {
              min: 5,
              max: 40,
            },
          },
          {
            title: {
              min: 1,
              max: 12,
            },
            text: {
              min: 5,
              max: 40,
            },
          },
        ],
      },
    },
    {
      component: "audio",
      audioUrl: "[audio-url]",
    },
    {
      component: "background",
      backgroundColor: "[Primary]",
    },
    {
      component: "img",
      id: "img1",
      image: "[image-q]",
      width: "30%",
      height: "47%",
      top: "5%",
      right: "65%",
      layer: 2,
      display: true,
    },
    {
      component: "video",
      id: "video1",
      video: "[video-h]",
      width: "30%",
      height: "47%",
      top: "5%",
      right: "65%",
      layer: 2,
      display: true,
    },
    {
      component: "card",
      id: "card1",
      extraClasses: "p-6 glass",
      width: "58%",
      height: "22%",
      right: "5%",
      top: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[title]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card2",
      extraClasses: "p-6 glass",
      width: "58%",
      height: "22%",
      right: "5%",
      top: "30%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card3",
      extraClasses: "p-6 glass",
      width: "90%",
      height: "20%",
      right: "5%",
      top: "54%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.1.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.1.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card4",
      extraClasses: "p-6 glass",
      width: "90%",
      height: "20%",
      right: "5%",
      top: "76%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.2.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.2.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "star",
      id: "star1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "61%",
      right: "-17%",
      layer: 1,
      display: true,
    },
  ],
  // 03-04 ✅
  [
    {
      component: "meta-tag",
      code: "03-04",
      order: 18,
      description: "Slide con asset vertical en la esquina izquierda",
      elements: {
        media: ["video-v"],
        title: {
          min: 1,
          max: 7,
        },
        text: {
          min: 1,
          max: 25,
        },
        sections: [
          {
            title: {
              min: 1,
              max: 7,
            },
            text: {
              min: 1,
              max: 25,
            },
          },
          {
            title: {
              min: 1,
              max: 7,
            },
            text: {
              min: 1,
              max: 25,
            },
          },
          {
            title: {
              min: 1,
              max: 7,
            },
            text: {
              min: 1,
              max: 25,
            },
          },
        ],
      },
    },
    {
      component: "audio",
      audioUrl: "[audio-url]",
    },
    {
      component: "background",
      backgroundColor: "[Primary]",
    },
    {
      component: "video",
      id: "vid1",
      video: "[video-v]",
      width: "30%",
      height: "90%",
      top: "5%",
      right: "65%",
      layer: 2,
      display: true,
    },
    {
      component: "img",
      id: "img1",
      image: "[image-v]",
      width: "30%",
      height: "90%",
      top: "5%",
      right: "65%",
      layer: 2,
      display: true,
    },
    {
      component: "card",
      id: "card1",
      extraClasses: "p-6 glass",
      width: "58%",
      height: "20%",
      right: "5%",
      top: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[title]",
      titleFontSize: 1.8,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card2",
      extraClasses: "p-6 glass",
      width: "58%",
      height: "20%",
      right: "5%",
      top: "29%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 1.8,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card3",
      extraClasses: "p-6 glass",
      width: "58%",
      height: "20%",
      right: "5%",
      top: "52%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.1.subtitle]",
      titleFontSize: 1.8,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.1.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card4",
      extraClasses: "p-6 glass",
      width: "58%",
      height: "20%",
      right: "5%",
      top: "75%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.2.subtitle]",
      titleFontSize: 1.8,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.2.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "star",
      id: "star1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "61%",
      right: "-8%",
      layer: 1,
      display: true,
    },
  ],
  // 04-00
  [
    {
      component: "meta-tag",
      code: "04-00",
      order: 22,
      description: "Slide sin fotos ni videos",
      elements: {
        media: [
          "icon-b",
          "icon-b",
          "icon-b",
          "icon-b"
        ],
        title: {
          "min": 1,
          "max": 5
        },
        text: {
          "min": 1,
          "max": 40
        },
        sections: [
          {
            title: {
              "min": 1,
              "max": 5
            },
            text: {
              "min": 1,
              "max": 30
            }
          },
          {
            title: {
              "min": 1,
              "max": 5
            },
            text: {
              "min": 1,
              "max": 30
            }
          },
          {
            title: {
              "min": 1,
              "max": 5
            },
            text: {
              "min": 1,
              "max": 30
            }
          },
          {
            title: {
              "min": 1,
              "max": 5
            },
            text: {
              "min": 1,
              "max": 30
            }
          }
        ]
      }
    },
    {
      component: "audio",
      audioUrl: "[audio-url]"
    },
    {
      component: "background",
      backgroundColor: "[Primary]"
    },
    {
      component: "card",
      id: "card1",
      width: "90%",
      height: "30%",
      right: "5%",
      top: "5%",
      extraClasses: "justify-center items-center text-center",
      title: "[title]",
      titleFontFamily: "Fira Sans",
      titleFontWeight: "200",
      titleFontSize: 3.7,
      titleFontColor: "[PrimaryText]",
      titleExtraClasses: "text-centered",
      text: "[text]",
      textExtraClasses: "text-centered",
      textFontSize: 1.9,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 4,
      display: true
    },
    {
      component: "iconRT",
      id: "iconRT1",
      icon: "[icon-b]",
      width: "45%",
      top: "37%",
      right: "52%",
      padding: "1cqw",
      extraClasses: "glass-12",
      circleColor: "#ffffff55",
      title: "[sections.0.subtitle]",
      titleFontFamily: "Fira Sans",
      titleFontWeight: "500",
      titleFontSize: 2,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.7,
      textFontColor: "[PrimaryText]",
      layer: 3,
      display: true
    },
    {
      component: "iconRT",
      id: "iconRT2",
      icon: "[icon-b]",
      width: "45%",
      top: "37%",
      right: "3%",
      padding: "1cqw",
      extraClasses: "glass-12",
      circleColor: "#ffffff55",
      title: "[sections.1.subtitle]",
      titleFontFamily: "Fira Sans",
      titleFontWeight: "500",
      titleFontSize: 2,
      titleFontColor: "[PrimaryText]",
      text: "[sections.1.text]",
      textFontSize: 1.7,
      textFontColor: "[PrimaryText]",
      layer: 3,
      display: true
    },
    {
      component: "iconRT",
      id: "iconRT3",
      icon: "[icon-b]",
      width: "45%",
      top: "66%",
      right: "52%",
      padding: "1cqw",
      extraClasses: "glass-12",
      circleColor: "#ffffff55",
      title: "[sections.2.subtitle]",
      titleFontFamily: "Fira Sans",
      titleFontWeight: "500",
      titleFontSize: 2,
      titleFontColor: "[PrimaryText]",
      text: "[sections.2.text]",
      textFontSize: 1.7,
      textFontColor: "[PrimaryText]",
      layer: 3,
      display: true
    },
    {
      component: "iconRT",
      id: "iconRT4",
      icon: "[icon-b]",
      width: "45%",
      top: "66%",
      right: "3%",
      padding: "1cqw",
      extraClasses: "glass-12",
      circleColor: "#ffffff55",
      title: "[sections.3.subtitle]",
      titleFontFamily: "Fira Sans",
      titleFontWeight: "500",
      titleFontSize: 2,
      titleFontColor: "[PrimaryText]",
      text: "[sections.3.text]",
      textFontSize: 1.7,
      textFontColor: "[PrimaryText]",
      layer: 3,
      display: true
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "60%",
      right: "35%",
      layer: 1,
      display: true
    }
  ],
  // 04-01 ✅
  [
    {
      component: "meta-tag",
      code: "04-01",
      order: 23,
      description: "Slide con asset cuadrado en la esquina superior izquierda",
      elements: {
        media: ["image-q"],
        title: {
          min: 1,
          max: 7,
        },
        text: {
          min: 15,
          max: 44,
        },
        sections: [
          {
            title: {
              min: 1,
              max: 7,
            },
            text: {
              min: 15,
              max: 44,
            },
          },
          {
            title: {
              min: 1,
              max: 7,
            },
            text: {
              min: 15,
              max: 35,
            },
          },
          {
            title: {
              min: 1,
              max: 7,
            },
            text: {
              min: 15,
              max: 35,
            },
          },
          {
            title: {
              min: 1,
              max: 7,
            },
            text: {
              min: 15,
              max: 35,
            },
          },
        ],
      },
    },
    {
      component: "audio",
      audioUrl: "[audio-url]",
    },
    {
      component: "background",
      backgroundColor: "[Primary]",
    },
    {
      component: "img",
      id: "img1",
      image: "[image-q]",
      width: "28%",
      height: "46%",
      top: "5%",
      right: "67%",
      layer: 2,
      display: true,
    },
    {
      component: "video",
      id: "video1",
      video: "[video-h]",
      width: "28%",
      height: "46%",
      top: "5%",
      right: "67%",
      layer: 2,
      display: true,
    },
    {
      component: "card",
      id: "card1",
      extraClasses: "p-6 glass",
      width: "28%",
      height: "46%",
      right: "36%",
      top: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[title]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card2",
      extraClasses: "p-6 glass",
      width: "28%",
      height: "46%",
      right: "5%",
      top: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card3",
      extraClasses: "p-6 glass",
      width: "28%",
      height: "42%",
      right: "67%",
      top: "54%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.1.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.1.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card4",
      extraClasses: "p-6 glass",
      width: "28%",
      height: "42%",
      right: "36%",
      top: "54%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.2.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.2.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card5",
      extraClasses: "p-6 glass",
      width: "28%",
      height: "42%",
      right: "5%",
      top: "54%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.3.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.3.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "star",
      id: "star1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "22%",
      right: "4%",
      layer: 1,
      display: true,
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "87%",
      right: "51%",
      layer: 1,
      display: true,
    },
  ],
  // 04-02 ✅
  [
    {
      component: "meta-tag",
      code: "04-02",
      order: 24,
      description:
        "Slide con asset horizontal en la esquina superior izquierda",
      elements: {
        media: ["image-h"],
        title: {
          min: 1,
          max: 20,
        },
        text: {
          min: 25,
          max: 65,
        },
        sections: [
          {
            title: {
              min: 1,
              max: 6,
            },
            text: {
              min: 10,
              max: 27,
            },
          },
          {
            title: {
              min: 1,
              max: 6,
            },
            text: {
              min: 10,
              max: 27,
            },
          },
          {
            title: {
              min: 1,
              max: 6,
            },
            text: {
              min: 10,
              max: 27,
            },
          },
          {
            title: {
              min: 1,
              max: 6,
            },
            text: {
              min: 10,
              max: 27,
            },
          },
        ],
      },
    },
    {
      component: "audio",
      audioUrl: "[audio-url]",
    },
    {
      component: "background",
      backgroundColor: "[Primary]",
    },
    {
      component: "img",
      id: "img1",
      image: "[image-h]",
      width: "28%",
      height: "35%",
      top: "5%",
      right: "67%",
      layer: 2,
      display: true,
    },
    {
      component: "video",
      id: "video1",
      video: "[video-h]",
      width: "28%",
      height: "35%",
      top: "5%",
      right: "67%",
      layer: 2,
      display: true,
    },
    {
      component: "card",
      id: "card1",
      width: "59%",
      height: "35%",
      right: "5%",
      top: "5%",
      title: "[title]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 1.7,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card2",
      extraClasses: "p-6 glass",
      width: "44%",
      height: "23%",
      right: "51%",
      top: "44%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "1.5cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card3",
      extraClasses: "p-6 glass",
      width: "44%",
      height: "23%",
      right: "5%",
      top: "44%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "1.5cqw",
      title: "[sections.1.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.1.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card4",
      extraClasses: "p-6 glass",
      width: "44%",
      height: "23%",
      right: "51%",
      top: "70%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "1.5cqw",
      title: "[sections.2.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.2.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card5",
      extraClasses: "p-6 glass",
      width: "44%",
      height: "23%",
      right: "5%",
      top: "70%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "1.5cqw",
      title: "[sections.3.subtitle]",
      titleFontSize: 2,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.3.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "54%",
      right: "6%",
      layer: 1,
      display: true,
    },
  ],
  // 04-03 ✅
  [
    {
      component: "meta-tag",
      code: "04-03",
      order: 25,
      description: "Slide con dos asset verticales",
      elements: {
        media: ["image-v", "image-v"],
        title: {
          min: 1,
          max: 7,
        },
        text: {
          min: 10,
          max: 27,
        },
        sections: [
          {
            title: {
              min: 1,
              max: 7,
            },
            text: {
              min: 10,
              max: 27,
            },
          },
          {
            title: {
              min: 1,
              max: 7,
            },
            text: {
              min: 7,
              max: 12,
            },
          },
          {
            title: {
              min: 1,
              max: 7,
            },
            text: {
              min: 7,
              max: 12,
            },
          },
          {
            title: {
              min: 1,
              max: 7,
            },
            text: {
              min: 7,
              max: 12,
            },
          },
        ],
      },
    },
    {
      component: "audio",
      audioUrl: "[audio-url]",
    },
    {
      component: "background",
      backgroundColor: "[Primary]",
    },
    {
      component: "img",
      id: "img1",
      image: "[image-v]",
      width: "28%",
      height: "50%",
      top: "5%",
      right: "67%",
      layer: 2,
      display: true,
    },
    {
      component: "img",
      id: "img2",
      image: "[image-v]",
      width: "28%",
      height: "50%",
      top: "5%",
      right: "36%",
      layer: 2,
      display: true,
    },
    {
      component: "card",
      id: "card1",
      extraClasses: "p-6 glass",
      width: "28%",
      height: "35%",
      right: "67%",
      top: "58%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[title]",
      titleFontSize: 1.8,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card2",
      extraClasses: "p-6 glass",
      width: "28%",
      height: "35%",
      right: "36%",
      top: "58%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 1.8,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card3",
      extraClasses: "p-6 glass",
      width: "28%",
      height: "28%",
      right: "5%",
      top: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.1.subtitle]",
      titleFontSize: 1.8,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.1.text]",
      textFontSize: 1.6,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card4",
      extraClasses: "p-6 glass",
      width: "28%",
      height: "28%",
      right: "5%",
      top: "35%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.2.subtitle]",
      titleFontSize: 1.8,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.2.text]",
      textFontSize: 1.6,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card5",
      extraClasses: "p-6 glass",
      width: "28%",
      height: "28%",
      right: "5%",
      top: "65%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.3.subtitle]",
      titleFontSize: 1.8,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.3.text]",
      textFontSize: 1.6,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "star",
      id: "star1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "77%",
      right: "77%",
      layer: 1,
      display: true,
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "19%",
      right: "-6%",
      layer: 1,
      display: true,
    },
  ],
  // 04-04 ✅
  [
    {
      component: "meta-tag",
      code: "04-04",
      order: 26,
      description: "Slide con dos asset",
      elements: {
        media: ["image-h", "image-h"],
        title: {
          min: 1,
          max: 7,
        },
        text: {
          min: 12,
          max: 42,
        },
        sections: [
          {
            title: {
              min: 1,
              max: 7,
            },
            text: {
              min: 12,
              max: 42,
            },
          },
          {
            title: {
              min: 1,
              max: 6,
            },
            text: {
              min: 6,
              max: 12,
            },
          },
          {
            title: {
              min: 1,
              max: 6,
            },
            text: {
              min: 6,
              max: 12,
            },
          },
          {
            title: {
              min: 1,
              max: 6,
            },
            text: {
              min: 6,
              max: 12,
            },
          },
        ],
      },
    },
    {
      component: "audio",
      audioUrl: "[audio-url]",
    },
    {
      component: "background",
      backgroundColor: "[Primary]",
    },
    {
      component: "img",
      id: "img1",
      image: "[image-h]",
      width: "25%",
      height: "42%",
      top: "5%",
      right: "36%",
      layer: 2,
      display: true,
    },
    {
      component: "img",
      id: "img2",
      image: "[image-h]",
      width: "25%",
      height: "42%",
      top: "51%",
      right: "36%",
      layer: 2,
      display: true,
    },
    {
      component: "card",
      id: "card1",
      extraClasses: "p-6 glass",
      width: "31%",
      height: "42%",
      right: "64%",
      top: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[title]",
      titleFontSize: 1.8,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card2",
      extraClasses: "p-6 glass",
      width: "31%",
      height: "42%",
      right: "64%",
      top: "51%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.0.subtitle]",
      titleFontSize: 1.8,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.0.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card3",
      extraClasses: "p-6 glass",
      width: "28%",
      height: "28%",
      right: "5%",
      top: "5%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.1.subtitle]",
      titleFontSize: 1.8,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.1.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card4",
      extraClasses: "p-6 glass",
      width: "28%",
      height: "28%",
      right: "5%",
      top: "35%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.2.subtitle]",
      titleFontSize: 1.8,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.2.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "card",
      id: "card5",
      extraClasses: "p-6 glass",
      width: "28%",
      height: "28%",
      right: "5%",
      top: "65%",
      borderRadius: "1.5rem",
      bgColor: "[Primary]",
      padding: "2cqw",
      title: "[sections.3.subtitle]",
      titleFontSize: 1.8,
      titleLineHeight: 1,
      titleFontColor: "[PrimaryText]",
      text: "[sections.3.text]",
      textFontSize: 1.5,
      textFontColor: "[PrimaryText]",
      textMarginTop: "1cqw",
      layer: 3,
      display: true,
    },
    {
      component: "circle",
      id: "circle1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "34%",
      right: "82%",
      layer: 1,
      display: true,
    },
    {
      component: "star",
      id: "star1",
      stopColor1: "[CenterObject]",
      stopColor2: "[FinalObject]",
      width: "30%",
      height: "30%",
      top: "64%",
      right: "-2%",
      layer: 1,
      display: true,
    },
  ]
]