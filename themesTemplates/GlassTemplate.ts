import { TemplateComponent } from "../CreateContent/interfaces";

type Template = TemplateComponent[];

export const GlassTemplate: Template[] = [
    
    [
        {
            "component": "meta-tag",
            "code": "00-00",
            "description": "Slide con video vertical",
            "elements": {
                "media": [
                    "video-v"
                ],
                "title": {
                    "min": 2,
                    "max": 2
                },
                "text": {
                    "min": 1,
                    "max": 40
                },
                "sections": []
            }
        },
        {
            "component": "audio",
            "audioUrl": "[audio-url]"
        },
        {
            "component": "background",
            "backgroundColor": "[Primary]"
        },
        {
            "component": "video",
            "id": "video1",
            "video": "[video-v]",
            "height": "100%",
            "right": "20%",
            "layer": 1,
            "display": true
        },
        {
            "component": "star",
            "id": "star1",
            "stopColor1": "[CenterObject]",
            "stopColor2": "[FinalObject]",
            "width": "40%",
            "height": "40%",
            "top": "25%",
            "right": "68%",
            "layer": 1,
            "display": true
        },
        {
            "component": "circle",
            "id": "circle1",
            "stopColor1": "[CenterObject]",
            "stopColor2": "[FinalObject]",
            "width": "30%",
            "height": "30%",
            "top": "82%",
            "right": "3%",
            "layer": 2,
            "display": true
        },
        {
            "component": "card",
            "id": "card1",
            "width": "20%",
            "height": "100%",
            "right": "0",
            "layer": 3,
            "extraClasses": "glass-12",
            "display": true
        },
        {
            "component": "card",
            "id": "card2",
            "width": "50%",
            "height": "100%",
            "right": "50%",
            "padding": "3cqw",
            "title": "[title]",
            "titleFontSize": 5,
            "titleFontColor": "[PrimaryText]",
            "titleLineHeight": "1",
            "text": "[text]",
            "textFontSize": 2.5,
            "textFontColor": "[PrimaryText]",
            "textMarginTop": "2cqw",
            "layer": 3,
            "extraClasses": "glass-12 justify-center",
            "display": true
        }
    ],
    [
        {
            "component": "meta-tag",
            "code": "00-01",
            "description": "Slide con video vertical",
            "elements": {
                "media": [
                    "video-v"
                ],
                "title": {
                    "min": 1,
                    "max": 1
                },
                "text": {
                    "min": 1,
                    "max": 60
                },
                "sections": []
            }
        },
        {
            "component": "audio",
            "audioUrl": "[audio-url]"
        },
        {
            "component": "background",
            "backgroundColor": "[Primary]"
        },
        {
            "component": "video",
            "id": "video1",
            "video": "[video-v]",
            "height": "100%",
            "right": "20%",
            "layer": 1,
            "display": true
        },
        {
            "component": "star",
            "id": "star1",
            "stopColor1": "[CenterObject]",
            "stopColor2": "[FinalObject]",
            "width": "40%",
            "height": "40%",
            "top": "25%",
            "right": "68%",
            "layer": 1,
            "display": true
        },
        {
            "component": "circle",
            "id": "circle1",
            "stopColor1": "[CenterObject]",
            "stopColor2": "[FinalObject]",
            "width": "30%",
            "height": "30%",
            "top": "82%",
            "right": "3%",
            "layer": 2,
            "display": true
        },
        {
            "component": "card",
            "id": "card1",
            "width": "20%",
            "height": "100%",
            "right": "0",
            "layer": 3,
            "extraClasses": "glass-12",
            "display": true
        },
        {
            "component": "card",
            "id": "card2",
            "width": "50%",
            "height": "100%",
            "right": "50%",
            "padding": "3cqw",
            "title": "[title]",
            "titleFontSize": 5,
            "titleFontColor": "[PrimaryText]",
            "titleLineHeight": "1",
            "text": "[text]",
            "textFontSize": 2.5,
            "textFontColor": "[PrimaryText]",
            "textMarginTop": "2cqw",
            "layer": 3,
            "extraClasses": "glass-12 justify-center",
            "display": true
        }
    ],
    [
        {
            "component": "meta-tag",
            "code": "00-02",
            "description": "Slide con video cuadrado/vertical, Texto a la derecha o izquierda.",
            "elements": {
                "media": [
                    "video-v"
                ],
                "title": {
                    "min": 1,
                    "max": 8
                },
                "text": {
                    "min": 1,
                    "max": 50
                },
                "sections": []
            }
        },
        {
            "component": "audio",
            "audioUrl": "[audio-url]"
        },
        {
            "component": "mediaWithVMirror",
            "video": "[video-v]",
            "image": "[image-q]",
            "rightOrLeft": "right",
            "layer": 1,
            "title": "[title]",
            "titleFontSize": 5,
            "titleFontColor": "[PrimaryText]",
            "text": "[text]",
            "textFontSize": 2.5,
            "textFontColor": "[PrimaryText]",
            "textMarginTop": "2cqw",
            "fontFamily": "Fira Sans",
            "display": true
        }
    ],
    [
        {
            "component": "meta-tag",
            "code": "00-03",
            "description": "Portada del curso",
            "elements": {
                "media": [
                    "icon-b",
                    "video-h"
                ],
                "title": {
                    "min": 1,
                    "max": 10
                },
                "text": {
                    "min": 0,
                    "max": 14
                },
                "sections": []
            }
        },
        {
            "component": "audio",
            "audioUrl": "[audio-url]"
        },
        {
            "component": "card",
            "id": "card1",
            "width": "100%",
            "height": "50%",
            "top": "25%",
            "padding": "6cqw",
            "extraClasses": "glass justify-center",
            "icon": "[icon-b]",
            "iconPosition": "absolute",
            "iconHeight": "30%",
            "iconRight": "4%",
            "title": "[title]",
            "titleFontSize": 6,
            "titleFontColor": "[SecondaryText]",
            "titleLineHeight": "6cqw",
            "text": "[text]",
            "textFontSize": 3.5,
            "textFontColor": "[SecondaryText]",
            "textExtraClasses": "",
            "textMarginTop": "1cqw",
            "layer": 3,
            "display": true
        },
        {
            "component": "video",
            "video": "[video-h]",
            "width": "100%",
            "height": "100%",
            "layer": 1,
            "display": true
        }
    ],
    [
        {
            "component": "meta-tag",
            "code": "00-04",
            "description": "Portada del curso",
            "elements": {
                "media": [
                    "video-h"
                ],
                "title": {
                    "min": 0,
                    "max": 0
                },
                "text": {
                    "min": 0,
                    "max": 0
                },
                "sections": []
            }
        },
        {
            "component": "audio",
            "audioUrl": "[audio-url]"
        },
 
        {
            "component": "video",
            "video": "[video-h]",
            "width": "100%",
            "height": "100%",
            "layer": 1,
            "display": true
        }
    ],
    [
        {
            "component": "meta-tag",
            "code": "01-00",
            "description": "Slide con video horizontal",
            "elements": {
                "media": [
                    "video-h",
                    "icon-b"
                ],
                "title": {
                    "min": 1,
                    "max": 4
                },
                "text": {
                    "min": 1,
                    "max": 20
                },
                "sections": [
                    {
                        "title": {
                            "min": 1,
                            "max": 8
                        },
                        "text": {
                            "min": 1,
                            "max": 40
                        }
                    }
                ]
            }
        },
        {
            "component": "audio",
            "audioUrl": "[audio-url]"
        },
        {
            "component": "mediaWithMirror",
            "video": "[video-h]",
            "layer": 1,
            "title": "[title]",
            "titleFontColor": "[PrimaryText]",
            "text": "[text]",
            "textFontSize": 2.5,
            "textFontColor": "[PrimaryText]",
            "textMarginTop": "2cqw",
            "fontFamily": "Fira Sans",
            "display": true
        },
        {
            "component": "card",
            "id": "card1",
            "extraClasses": "p-6",
            "width": "25%",
            "height": "60%",
            "right": "4%",
            "top": "20%",
            "borderRadius": "1.5rem",
            "bgColor": "[Primary]",
            "padding": "1cqw",
            "icon": "[icon-b]",
            "iconWidth": "clamp(40px, 30%, 30%)",
            "iconMargingRight": "4%",
            "title": "[sections.0.subtitle]",
            "titleFontSize": 2,
            "titleLineHeight": "2cqw",
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.0.text]",
            "textFontSize": 1.8,
            "textFontColor": "[PrimaryText]",
            "textMarginTop": "1cqw",
            "layer": 3,
            "display": true
        },
        {
            "component": "card",
            "id": "card2",
            "width": "25%",
            "height": "100%",
            "right": "0",
            "bgColor": "[Primary]",
            "position": "relative",
            "alignment": "flex items-center justify-center",
            "layer": 2,
            "display": true
        }
    ],
    [
        {
            "component": "meta-tag",
            "code": "01-05",
            "description": "Slide sin fotos ni video",
            "elements": {
                "media": [],
                "title": {
                    "min": 1,
                    "max": 15
                },
                "text": {
                    "min": 1,
                    "max": 100
                },
                "sections": [
                    {
                        "title": {
                            "min": 1,
                            "max": 10
                        },
                        "text": {
                            "min": 1,
                            "max": 60
                        }
                    }
                ]
            }
        },
        {
            "component": "audio",
            "audioUrl": "[audio-url]"
        },
        {
            "component": "background",
            "backgroundColor": "[Primary]"
        },
        {
            "component": "card",
            "id": "card1",
            "width": "50%",
            "padding": "5cqw",
            "bgColor": "[Secondary]",
            "title": "[title]",
            "titleFontSize": 3.5,
            "titleFontColor": "[SecondaryText]",
            "titleFontWeight": "200",
            "text": "[text]",
            "textMarginTop": "1cqw",
            "textFontSize": 2,
            "textFontColor": "[SecondaryText]",
            "layer": 5,
            "extraClasses": "glass-12-sb justify-center",
            "display": true
        },
        {
            "component": "card",
            "id": "card2",
            "width": "50%",
            "right":"0",
            "padding": "2cqw",
            "bgColor": "[Primary]",
            "layer": 5,
            "extraClasses": "glass-12-sb",
            "display": true
        },
        {
            "component": "circle",
            "id": "circle1",
            "stopColor1": "[CenterObject]",
            "stopColor2": "[FinalObject]",
            "width": "45%",
            "height": "45%",
            "top": "60%",
            "right": "-18%",
            "layer": 6,
            "display": true
        },
        {
            "component": "card",
            "id": "card3",
            "top": "30%",
            "right":"5%",
            "width": "48%",
            "height": "40%",
            "extraClasses": "glass justify-center",
            "padding": "2cqw",
            "title": "[sections.0.subtitle]",
            "titleFontSize": 2.2,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.0.text]",
            "textFontSize": 1.7,
            "textFontColor": "[PrimaryText]",
            "textMarginTop": "1cqw",
            "layer": 7,
            "display": true
        },
    
        {
            "component": "star",
            "id": "star1",
            "stopColor1": "[CenterObject]",
            "stopColor2": "[FinalObject]",
            "width": "40%",
            "height": "40%",
            "top": "12%",
            "right": "68%",
            "layer": 1,
            "display": true
        },
        {
            "component": "circle",
            "id": "circle2",
            "stopColor1": "[CenterObject]",
            "stopColor2": "[FinalObject]",
            "width": "30%",
            "height": "30%",
            "top": "85%",
            "right": "36%",
            "layer": 3,
            "display": true
        }
    ],
    [
        {
            "component": "meta-tag",
            "code": "02-00",
            "description": "Slide con una imagen cuadrada",
            "elements": {
                "media": [
                    "icon-b",
                    "icon-b",
                    "image-q"
                ],
                "title": {
                    "min": 1,
                    "max": 15
                },
                "text": {
                    "min": 1,
                    "max": 40
                },
                "sections": [
                    {
                        "title": {
                            "min": 1,
                            "max": 5
                        },
                        "text": {
                            "min": 1,
                            "max": 30
                        }
                    },
                    {
                        "title": {
                            "min": 1,
                            "max": 5
                        },
                        "text": {
                            "min": 1,
                            "max": 30
                        }
                    }
                ]
            }
        },
        {
            "component": "audio",
            "audioUrl": "[audio-url]"
        },
        {
            "component": "background",
            "backgroundColor": "[Primary]"
        },
        {
            "component": "card",
            "id": "card1",
            "width": "50%",
            "height": "80%",
            "padding": "2cqw",
            "title": "[title]",
            "titleFontSize": 3.5,
            "titleFontColor": "[PrimaryText]",
            "titleFontWeight": "200",
            "text": "[text]",
            "textMarginTop": "1cqw",
            "textFontSize": 2,
            "textFontColor": "[PrimaryText]",
            "layer": 5,
            "extraClasses": "glass-12 justify-center",
            "display": true
        },
        {
            "component": "card",
            "id": "card2",
            "top": "80%",
            "width": "50%",
            "height": "20%",
            "extraClasses": "glass justify-center",
            "padding": "1cqw",
            "title": "[sections.0.subtitle]",
            "titleFontSize": 1.2,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.0.text]",
            "textFontSize": 1,
            "textFontColor": "[PrimaryText]",
            "icon": "[icon-b]",
            "iconWidth": "clamp(40px, 3%, 3%)",
            "layer": 4,
            "display": true
        },
        {
            "component": "card",
            "id": "card3",
            "right": "0px",
            "top": "80%",
            "width": "50%",
            "height": "20%",
            "bgColor": "#fff",
            "extraClasses": "justify-center",
            "padding": "1cqw",
            "title": "[sections.1.subtitle]",
            "titleFontSize": 1.2,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.1.text]",
            "textFontSize": 1,
            "textFontColor": "[PrimaryText]",
            "icon": "[icon-b]",
            "iconWidth": "clamp(40px, 3%, 3%)",
            "iconMargingRight": "1cqw",
            "layer": 4,
            "display": true
        },
        {
            "component": "img",
            "id": "img1",
            "image": "[image-q]",
            "width": "50%",
            "height": "80%",
            "right": "0px",
            "layer": 6,
            "display": true
        },
        {
            "component": "video",
            "id": "video1",
            "video": "[video-h]",
            "width": "50%",
            "height": "80%",
            "right": "0px",
            "layer": 6,
            "display": true
        },
        {
            "component": "star",
            "id": "star1",
            "stopColor1": "[CenterObject]",
            "stopColor2": "[FinalObject]",
            "width": "40%",
            "height": "40%",
            "top": "12%",
            "right": "68%",
            "layer": 1,
            "display": true
        },
        {
            "component": "circle",
            "id": "circle1",
            "stopColor1": "[CenterObject]",
            "stopColor2": "[FinalObject]",
            "width": "30%",
            "height": "30%",
            "top": "85%",
            "right": "36%",
            "layer": 3,
            "display": true
        }
    ],
    [
        {
            "component": "meta-tag",
            "code": "02-01",
            "description": "Slide con 2 fotos cuadradas y 1 video vertical",
            "elements": {
                "media": [
                    "video-v",
                    "image-q",
                    "image-q"
                ],
                "title": {
                    "min": 1,
                    "max": 5
                },
                "text": {
                    "min": 1,
                    "max": 40
                },
                "sections": [
                    {
                        "title": {
                            "min": 1,
                            "max": 2
                        },
                        "text": {
                            "min": 1,
                            "max": 8
                        }
                    },
                    {
                        "title": {
                            "min": 1,
                            "max": 2
                        },
                        "text": {
                            "min": 1,
                            "max": 8
                        }
                    }
                ]
            }
        },
        {
            "component": "audio",
            "audioUrl": "[audio-url]"
        },
        {
            "component": "card",
            "id": "card1",
            "width": "70%",
            "height": "30%",
            "right": "0",
            "top": "35%",
            "layer": 4,
            "extraClasses": "glass justify-center",
            "display": true
        },
        {
            "component": "card",
            "id": "card2",
            "width": "40%",
            "height": "100%",
            "right": "0",
            "bgColor": "[Primary]",
            "layer": 2,
            "display": true
        },
        {
            "component": "card",
            "id": "card3",
            "title": "[title]",
            "titleFontSize": 3.5,
            "titleFontColor": "[PrimaryText]",
            "width": "32%",
            "height": "30%",
            "right": "5%",
            "top": "4.5%",
            "extraClasses": "justify-center",
            "layer": 5,
            "display": true
        },
        {
            "component": "card",
            "id": "card4",
            "text": "[text]",
            "textFontSize": 1.5,
            "textFontColor": "[PrimaryText]",
            "width": "32%",
            "height": "25%",
            "right": "5%",
            "top": "72%",
            "layer": 5,
            "display": true
        },
        {
            "component": "card",
            "id": "card5",
            "extraClasses": "justify-center",
            "title": "[sections.0.subtitle]",
            "titleFontSize": 3,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.0.text]",
            "textFontSize": 1.5,
            "textFontColor": "[PrimaryText]",
            "width": "25%",
            "height": "25%",
            "right": "42%",
            "top": "39%",
            "layer": 5,
            "display": true
        },
        {
            "component": "card",
            "id": "card6",
            "title": "[sections.1.subtitle]",
            "extraClasses": "justify-center",
            "titleFontSize": 3,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.1.text]",
            "textFontSize": 1.5,
            "textFontColor": "[PrimaryText]",
            "width": "32%",
            "height": "25%",
            "right": "5%",
            "top": "39%",
            "layer": 5,
            "display": true
        },
        {
            "component": "video",
            "id": "video1",
            "video": "[video-v]",
            "width": "30%",
            "height": "100%",
            "right": "40%",
            "layer": 1,
            "display": true
        },
        {
            "component": "img",
            "id": "img1",
            "image": "[image-q]",
            "width": "30%",
            "height": "50%",
            "layer": 1,
            "display": true
        },
        {
            "component": "img",
            "id": "img2",
            "image": "[image-q]",
            "width": "30%",
            "height": "50%",
            "top": "50%",
            "layer": 1,
            "display": true
        },
        {
            "component": "circle",
            "id": "circle1",
            "stopColor1": "[CenterObject]",
            "stopColor2": "[FinalObject]",
            "width": "30%",
            "height": "30%",
            "top": "50%",
            "right": "-15%",
            "layer": 3,
            "display": true
        }
    ],
    [
        {
            "component": "meta-tag",
            "code": "02-02",
            "description": "Slide sin fotos ni videos",
            "elements": {
                "media": [
                    "icon-w",
                    "icon-w"
                ],
                "title": {
                    "min": 1,
                    "max": 15
                },
                "text": {
                    "min": 1,
                    "max": 50
                },
                "sections": [
                    {
                        "title": {
                            "min": 1,
                            "max": 3
                        },
                        "text": {
                            "min": 1,
                            "max": 25
                        }
                    },
                    {
                        "title": {
                            "min": 1,
                            "max": 3
                        },
                        "text": {
                            "min": 1,
                            "max": 25
                        }
                    }
                ]
            }
        },
        {
            "component": "audio",
            "audioUrl": "[audio-url]"
        },
        {
            "component": "background",
            "backgroundColor": "[Primary]"
        },
        {
            "component": "circle",
            "id": "circle1",
            "stopColor1": "[CenterObject]",
            "stopColor2": "[FinalObject]",
            "height": "40%",
            "top": "47%",
            "right": "3%",
            "layer": 2,
            "display": true
        },
        {
            "component": "card",
            "id": "card1",
            "width": "35%",
            "right": "15%",
            "layer": 3,
            "extraClasses": "glass",
            "display": true
        },
        {
            "component": "iconRL",
            "id": "iconRL1",
            "icon": "[icon-w]",
            "width": "33%",
            "height": "8%",
            "top": "10%",
            "right": "16%",
            "layer": 4,
            "display": true
        },
        {
            "component": "iconRL",
            "id": "iconRL2",
            "icon": "[icon-w]",
            "width": "33%",
            "height": "8%",
            "top": "53%",
            "right": "16%",
            "layer": 4,
            "display": true
        },
        {
            "component": "card",
            "id": "card2",
            "title": "[title]",
            "titleFontSize": 3,
            "titleFontColor": "[PrimaryText]",
            "titleLineHeight": "1.1",
            "text": "[text]",
            "textFontSize": 2,
            "textFontColor": "[PrimaryText]",
            "textFontWeight": "200",
            "textMarginTop": "1.5cqw",
            "width": "40%",
            "height": "90%",
            "right": "55%",
            "top": "8%",
            "layer": 4,
            "display": true
        },
        {
            "component": "card",
            "id": "card3",
            "extraClasses": "",
            "width": "30%",
            "height": "60%",
            "right": "16%",
            "top": "20%",
            "title": "[sections.0.subtitle]",
            "titleFontSize": 1.5,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.0.text]",
            "textFontSize": 1.3,
            "textFontColor": "[PrimaryText]",
            "textMarginTop": "0.8cqw",
            "layer": 4,
            "display": true
        },
        {
            "component": "card",
            "id": "card4",
            "extraClasses": "",
            "width": "30%",
            "height": "60%",
            "right": "16%",
            "top": "63%",
            "title": "[sections.1.subtitle]",
            "titleFontSize": 1.5,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.1.text]",
            "textFontSize": 1.3,
            "textFontColor": "[PrimaryText]",
            "textMarginTop": "0.8cqw",
            "layer": 4,
            "display": true
        }
    ],
    [
        {
            "component": "meta-tag",
            "code": "03-00",
            "description": "Slide sin Fotos ni Videos",
            "elements": {
                "media": [
                    "icon-b",
                    "icon-b",
                    "icon-b"
                ],
                "title": {
                    "min": 1,
                    "max": 20
                },
                "text": {
                    "min": 1,
                    "max": 40
                },
                "sections": [
                    {
                        "title": {
                            "min": 1,
                            "max": 3
                        },
                        "text": {
                            "min": 1,
                            "max": 20
                        }
                    },
                    {
                        "title": {
                            "min": 1,
                            "max": 3
                        },
                        "text": {
                            "min": 1,
                            "max": 20
                        }
                    },
                    {
                        "title": {
                            "min": 1,
                            "max": 3
                        },
                        "text": {
                            "min": 1,
                            "max": 20
                        }
                    }
                ]
            }
        },
        {
            "component": "audio",
            "audioUrl": "[audio-url]"
        },
        {
            "component": "background",
            "backgroundColor": "[Primary]"
        },
        {
            "component": "card",
            "id": "card2",
            "bgColor": "[Primary]",
            "width": "50%",
            "height": "5%",
            "right": "0",
            "top": "0",
            "layer": 4,
            "display": true
        },
        {
            "component": "card",
            "id": "card3",
            "width": "50%",
            "height": "100%",
            "top": "0",
            "right": "50%",
            "padding": "6cqw",
            "bgColor":"[Primary]",
            "extraClasses": "justify-center",
            "title": "[title]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 3,
            "titleFontColor": "[PrimaryText]",
            "text": "[text]",
            "textFontSize": 1.5,
            "textFontColor": "[PrimaryText]",
            "textFontWeight": "200",
            "textMarginTop": "1.5cqw",
            "layer": 4,
            "display": true
        },
        {
            "component": "iconRT",
            "id": "iconRT1",
            "icon": "[icon-b]",
            "width": "45%",
            "top": "10%",
            "right": "3%",
            "circleColor": "#ffffff55",
            "title": "[sections.0.subtitle]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 2,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.0.text]",
            "textFontSize": 1.8,
            "textFontColor": "[PrimaryText]",
            "layer": 3,
            "display": true
        },
        {
            "component": "iconRT",
            "id": "iconRT2",
            "icon": "[icon-b]",
            "width": "45%",
            "top": "41%",
            "right": "3%",
            "circleColor": "#ffffff55",
            "title": "[sections.1.subtitle]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 2,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.1.text]",
            "textFontSize": 1.8,
            "textFontColor": "[PrimaryText]",
            "layer": 3,
            "display": true
        },
        {
            "component": "iconRT",
            "id": "iconRT3",
            "icon": "[icon-b]",
            "width": "45%",
            "top": "72%",
            "right": "3%",
            "circleColor": "#ffffff55",
            "title": "[sections.2.subtitle]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 2,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.2.text]",
            "textFontSize": 1.8,
            "textFontColor": "[PrimaryText]",
            "layer": 3,
            "display": true
        },
        {
            "component": "card",
            "id": "card1",
            "width": "50%",
            "height": "100%",
            "right": "0",
            "layer": 2,
            "extraClasses": "glass",
            "display": true
        },
        {
            "component": "circle",
            "id": "circle1",
            "stopColor1": "[CenterObject]",
            "stopColor2": "[FinalObject]",
            "width": "30%",
            "height": "30%",
            "top": "70%",
            "right": "35%",
            "layer": 1,
            "display": true
        }
    ],
    [
        {
            "component": "meta-tag",
            "code": "03-01",
            "description": "Slide con tres imágenes horizontales",
            "elements": {
                "media": [
                    "image-h",
                    "image-h",
                    "image-h"
                ],
                "title": {
                    "min": 1,
                    "max": 10
                },
                "text": {
                    "min": 1,
                    "max": 40
                },
                "sections": [
                    {
                        "title": {
                            "min": 1,
                            "max": 7
                        },
                        "text": {
                            "min": 1,
                            "max": 30
                        }
                    },
                    {
                        "title": {
                            "min": 1,
                            "max": 7
                        },
                        "text": {
                            "min": 1,
                            "max": 30
                        }
                    },
                    {
                        "title": {
                            "min": 1,
                            "max": 7
                        },
                        "text": {
                            "min": 1,
                            "max": 30
                        }
                    }
                ]
            }
        },
        {
            "component": "audio",
            "audioUrl": "[audio-url]"
        },
        {
            "component": "background",
            "backgroundColor": "[Primary]"
        },
        {
            "component": "card",
            "id": "card4",
            "title": "[title]",
            "titleFontSize": 3,
            "titleFontColor": "[PrimaryText]",
            "titleLineHeight": "1.1",
            "width": "30%",
            "height": "20%",
            "right": "65%",
            "top": "5%",
            "layer": 4,
            "display": true
        },
        {
            "component": "card",
            "id": "card2",
            "text": "[text]",
            "textFontSize": 2,
            "textFontColor": "[PrimaryText]",
            "textFontWeight": "200",
            "width": "55%",
            "height": "20%",
            "right": "5.3%",
            "top": "5%",
            "layer": 4,
            "display": true
        },
        {
            "component": "img",
            "id": "img1",
            "image": "[image-h]",
            "width": "28%",
            "height": "28%",
            "top": "34%",
            "right": "66.6%",
            "imgExtraClasses":"rounded-top",
            "layer": 8,
            "display": true
        },
        {
            "component": "img",
            "id": "img2",
            "image": "[image-h]",
            "width": "28%",
            "height": "28%",
            "top": "34%",
            "right": "35.95%",
            "imgExtraClasses":"rounded-top",
            "layer": 8,
            "display": true
        },
        {
            "component": "img",
            "id": "img3",
            "image": "[image-h]",
            "width": "28%",
            "height": "28%",
            "top": "34%",
            "right": "5.3%",
            "imgExtraClasses":"rounded-top",
            "layer": 8,
            "display": true
        },
        {
            "component": "card",
            "id": "card1",
            "top": "62%",
            "right": "66.6%",
            "width": "28%",
            "height": "30%",
            "extraClasses": "glass justify-top",
            "padding": "1cqw",
            "title": "[sections.0.subtitle]",
            "titleFontSize": 1.6,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.0.text]",
            "textFontSize": 1.4,
            "textFontColor": "[PrimaryText]",
            "textMarginTop": "1cqw",
            "layer": 4,
            "display": true
        },
        {
            "component": "card",
            "id": "card2",
            "top": "62%",
            "right": "35.95%",
            "width": "28%",
            "height": "30%",
            "extraClasses": "glass justify-top",
            "padding": "1cqw",
            "title": "[sections.1.subtitle]",
            "titleFontSize": 1.6,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.1.text]",
            "textFontSize": 1.4,
            "textFontColor": "[PrimaryText]",
            "textMarginTop": "1cqw",
            "layer": 4,
            "display": true
        },
        {
            "component": "card",
            "id": "card3",
            "top": "62%",
            "right": "5.3%",
            "width": "28%",
            "height": "30%",
            "extraClasses": "glass justify-top",
            "padding": "1cqw",
            "title": "[sections.2.subtitle]",
            "titleFontSize": 1.6,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.2.text]",
            "textFontSize": 1.4,
            "textFontColor": "[PrimaryText]",
            "textMarginTop": "1cqw",
            "layer": 4,
            "display": true
        },
        {
            "component": "star",
            "id": "star1",
            "stopColor1": "[CenterObject]",
            "stopColor2": "[FinalObject]",
            "width": "60%",
            "height": "60%",
            "top": "30%",
            "right": "70%",
            "layer": 1,
            "display": true
        },
        {
            "component": "circle",
            "id": "circle1",
            "stopColor1": "[CenterObject]",
            "stopColor2": "[FinalObject]",
            "width": "30%",
            "height": "30%",
            "top": "85%",
            "right": "20%",
            "layer": 3,
            "display": true
        }
    ],
    [
        {
            "component": "meta-tag",
            "code": "04-00",
            "description": "Slide sin fotos ni videos",
            "elements": {
                "media": [
                    "icon-b",
                    "icon-b",
                    "icon-b",
                    "icon-b"
                ],
                "title": {
                    "min": 1,
                    "max": 5
                },
                "text": {
                    "min": 1,
                    "max": 40
                },
                "sections": [
                    {
                        "title": {
                            "min": 1,
                            "max": 5
                        },
                        "text": {
                            "min": 1,
                            "max": 30
                        }
                    },
                    {
                        "title": {
                            "min": 1,
                            "max": 5
                        },
                        "text": {
                            "min": 1,
                            "max": 30
                        }
                    },
                    {
                        "title": {
                            "min": 1,
                            "max": 5
                        },
                        "text": {
                            "min": 1,
                            "max": 30
                        }
                    },
                    {
                        "title": {
                            "min": 1,
                            "max": 5
                        },
                        "text": {
                            "min": 1,
                            "max": 30
                        }
                    }
                ]
            }
        },
        {
            "component": "audio",
            "audioUrl": "[audio-url]"
        },
        {
            "component": "background",
            "backgroundColor": "[Primary]"
        },
        {
            "component": "card",
            "id": "card1",
            "width": "90%",
            "height": "30%",
            "right": "5%",
            "top": "5%",
            "extraClasses": "justify-center items-center text-center",
            "title": "[title]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "200",
            "titleFontSize": 3.7,
            "titleFontColor": "[PrimaryText]",
            "titleExtraClasses": "text-centered",
            "text": "[text]",
            "textExtraClasses": "text-centered",
            "textFontSize": 1.9,
            "textFontColor": "[PrimaryText]",
            "textMarginTop": "1cqw",
            "layer": 4,
            "display": true
        },
        {
            "component": "iconRT",
            "id": "iconRT1",
            "icon": "[icon-b]",
            "width": "45%",
            "top": "37%",
            "right": "52%",
            "padding": "1cqw",
            "extraClasses": "glass-12",
            "circleColor": "#ffffff55",
            "title": "[sections.0.subtitle]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 1.8,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.0.text]",
            "textFontSize": 1.2,
            "textFontColor": "[PrimaryText]",
            "layer": 3,
            "display": true
        },
        {
            "component": "iconRT",
            "id": "iconRT2",
            "icon": "[icon-b]",
            "width": "45%",
            "top": "37%",
            "right": "3%",
            "padding": "1cqw",
            "extraClasses": "glass-12",
            "circleColor": "#ffffff55",
            "title": "[sections.1.subtitle]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 1.8,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.1.text]",
            "textFontSize": 1.2,
            "textFontColor": "[PrimaryText]",
            "layer": 3,
            "display": true
        },
        {
            "component": "iconRT",
            "id": "iconRT3",
            "icon": "[icon-b]",
            "width": "45%",
            "top": "66%",
            "right": "52%",
            "padding": "1cqw",
            "extraClasses": "glass-12",
            "circleColor": "#ffffff55",
            "title": "[sections.2.subtitle]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 1.8,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.2.text]",
            "textFontSize": 1.2,
            "textFontColor": "[PrimaryText]",
            "layer": 3,
            "display": true
        },
        {
            "component": "iconRT",
            "id": "iconRT4",
            "icon": "[icon-b]",
            "width": "45%",
            "top": "66%",
            "right": "3%",
            "padding": "1cqw",
            "extraClasses": "glass-12",
            "circleColor": "#ffffff55",
            "title": "[sections.3.subtitle]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 1.8,
            "titleFontColor": "[PrimaryText]",
            "text": "[sections.3.text]",
            "textFontSize": 1.2,
            "textFontColor": "[PrimaryText]",
            "layer": 3,
            "display": true
        },
        {
            "component": "circle",
            "id": "circle1",
            "stopColor1": "[CenterObject]",
            "stopColor2": "[FinalObject]",
            "width": "30%",
            "height": "30%",
            "top": "60%",
            "right": "35%",
            "layer": 1,
            "display": true
        }
    ]
]