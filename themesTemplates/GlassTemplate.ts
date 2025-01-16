import { TemplateComponent } from "../CreateContent/interfaces";

type Template = TemplateComponent[];

export const GlassTemplate: Template[] = [
    [
        {
            "component": "meta-tag",
            "code": "PO-00",
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
                    "max": 13
                },
                "sections": []
            }
        },
        {
            "component": "card",
            "id": "card1",
            "width": "100%",
            "height": "50%",
            "top": "25%",
            "padding": "6cqw",
            "extraClasses": "glass justify-center",
            "icon-b": "[icon]",
            "iconPosition": "absolute",
            "iconHeight": "30%",
            "iconRight": "4%",
            "title": "[title]",
            "titleFontSize": 6,
            "titleFontColor": "#FFF",
            "titleLineHeight": "6cqw",
            "text": "[text]",
            "textFontSize": 3.5,
            "textFontColor": "#FFF",
            "textExtraClasses": "#FFF",
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
            "component": "background",
            "backgroundColor": "#e3e5fa"
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
            "stopColor1": "#7dc2ff",
            "stopColor2": "#1674c7",
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
            "stopColor1": "#7dc2ff",
            "stopColor2": "#1674c7",
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
            "titleFontColor": "#000",
            "titleLineHeight": "1",
            "text": "[text]",
            "textFontSize": 2.5,
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
                    "video-h"
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
            "component": "background",
            "backgroundColor": "#e3e5fa"
        },
        {
            "component": "video",
            "id": "video1",
            "video": "[video-h]",
            "height": "100%",
            "right": "20%",
            "layer": 1,
            "display": true
        },
        {
            "component": "star",
            "id": "star1",
            "stopColor1": "#7dc2ff",
            "stopColor2": "#1674c7",
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
            "stopColor1": "#7dc2ff",
            "stopColor2": "#1674c7",
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
            "titleFontColor": "#000",
            "titleLineHeight": "1",
            "text": "[text]",
            "textFontSize": 2.5,
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
            "component": "mediaWithVMirror",
            "video": "[video-v]",
            "rightOrLeft": "right",
            "layer": 1,
            "title": "[title]",
            "titleFontSize": 5,
            "text": "[text]",
            "textFontSize": 2.5,
            "textMarginTop": "2cqw",
            "fontFamily": "Fira Sans",
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
            "component": "mediaWithMirror",
            "video": "[video-h]",
            "layer": 1,
            "title": "[title]",
            "text": "[text]",
            "textFontSize": 2.5,
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
            "bgColor": "#e3e5fa",
            "padding": "1cqw",
            "icon-b": "[icon]",
            "iconWidth": "clamp(40px, 30%, 30%)",
            "iconMargingRight": "4%",
            "title": "[sections.0.subtitle]",
            "titleFontSize": 2,
            "titleLineHeight": "2cqw",
            "titleFontColor": "#353535",
            "text": "[sections.0.text]",
            "textFontSize": 1.8,
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
            "bgColor": "#e3e5fa",
            "position": "relative",
            "alignment": "flex items-center justify-center",
            "layer": 2,
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
                            "max": 12
                        }
                    },
                    {
                        "title": {
                            "min": 1,
                            "max": 5
                        },
                        "text": {
                            "min": 1,
                            "max": 12
                        }
                    }
                ]
            }
        },
        {
            "component": "background",
            "backgroundColor": "#e3e5fa"
        },
        {
            "component": "card",
            "id": "card1",
            "width": "50%",
            "height": "80%",
            "padding": "2cqw",
            "title": "[title]",
            "titleFontSize": 3.5,
            "titleFontColor": "#2e2e2e",
            "titleFontWeight": "200",
            "text": "[text]",
            "textMarginTop": "1cqw",
            "textFontSize": 2,
            "layer": 5,
            "extraClasses": "glass-12",
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
            "text": "[sections.0.text]",
            "textFontSize": 1,
            "icon-b": "[icon]",
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
            "text": "[sections.1.text]",
            "textFontSize": 1,
            "icon-b": "[icon]",
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
            "component": "star",
            "id": "star1",
            "stopColor1": "#7dc2ff",
            "stopColor2": "#1674c7",
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
            "stopColor1": "#7dc2ff",
            "stopColor2": "#1674c7",
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
            "bgColor": "#e3e5fa",
            "layer": 2,
            "display": true
        },
        {
            "component": "card",
            "id": "card3",
            "title": "[title]",
            "titleFontSize": 3.5,
            "titleFontColor": "#333232",
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
            "titleFontColor": "#FFF",
            "text": "[sections.0.text]",
            "textFontSize": 1.5,
            "textFontColor": "#FFF",
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
            "titleFontColor": "#333232",
            "text": "[sections.1.text]",
            "textFontSize": 1.5,
            "textFontColor": "#333232",
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
            "stopColor1": "#7dc2ff",
            "stopColor2": "#1674c7",
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
            "component": "background",
            "backgroundColor": "#e3e5fa"
        },
        {
            "component": "circle",
            "id": "circle1",
            "stopColor1": "#7dc2ff",
            "stopColor2": "#1674c7",
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
            "icon-b": "[icon]",
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
            "icon-b": "[icon]",
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
            "titleFontColor": "#000",
            "titleLineHeight": "1.1",
            "text": "[text]",
            "textFontSize": 2,
            "textFontColor": "#000",
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
            "titleFontColor": "#353535",
            "text": "[sections.0.text]",
            "textFontSize": 1.3,
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
            "titleFontColor": "#353535",
            "text": "[sections.1.text]",
            "textFontSize": 1.3,
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
                    "max": 2
                },
                "text": {
                    "min": 1,
                    "max": 25
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
            "component": "background",
            "backgroundColor": "#e3e5fa"
        },
        {
            "component": "card",
            "id": "card2",
            "bgColor": "#0a4a8f",
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
            "width": "30%",
            "height": "100%",
            "top": "0",
            "right": "60%",
            "extraClasses": "justify-center",
            "title": "[title]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 3,
            "titleFontColor": "#3f3f3f",
            "text": "[text]",
            "textFontSize": 1.5,
            "textFontColor": "#000",
            "textFontWeight": "200",
            "textMarginTop": "1.5cqw",
            "layer": 4,
            "display": true
        },
        {
            "component": "iconRT",
            "id": "iconRT1",
            "icon-b": "[icon]",
            "width": "45%",
            "top": "10%",
            "right": "3%",
            "circleColor": "#ffffff55",
            "title": "[sections.0.subtitle]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 2,
            "titleFontColor": "#3f3f3f",
            "text": "[sections.0.text]",
            "textFontSize": 1.8,
            "layer": 3,
            "display": true
        },
        {
            "component": "iconRT",
            "id": "iconRT2",
            "icon-b": "[icon]",
            "width": "45%",
            "top": "41%",
            "right": "3%",
            "circleColor": "#ffffff55",
            "title": "[sections.1.subtitle]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 2,
            "titleFontColor": "#3f3f3f",
            "text": "[sections.1.text]",
            "textFontSize": 1.8,
            "layer": 3,
            "display": true
        },
        {
            "component": "iconRT",
            "id": "iconRT3",
            "icon-b": "[icon]",
            "width": "45%",
            "top": "72%",
            "right": "3%",
            "circleColor": "#ffffff55",
            "title": "[sections.2.subtitle]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 2,
            "titleFontColor": "#3f3f3f",
            "text": "[sections.2.text]",
            "textFontSize": 1.8,
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
            "stopColor1": "#d65cb3",
            "stopColor2": "#a63a87",
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
                            "max": 20
                        }
                    },
                    {
                        "title": {
                            "min": 1,
                            "max": 5
                        },
                        "text": {
                            "min": 1,
                            "max": 20
                        }
                    },
                    {
                        "title": {
                            "min": 1,
                            "max": 5
                        },
                        "text": {
                            "min": 1,
                            "max": 20
                        }
                    },
                    {
                        "title": {
                            "min": 1,
                            "max": 5
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
            "component": "background",
            "backgroundColor": "#e3e5fa"
        },
        {
            "component": "card",
            "id": "card1",
            "width": "80%",
            "height": "30%",
            "right": "10%",
            "top": "0",
            "extraClasses": "justify-center items-center text-center",
            "title": "[title]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "200",
            "titleFontSize": 4,
            "titleFontColor": "#3f3f3f",
            "titleExtraClasses": "text-centered",
            "text": "[text]",
            "textExtraClasses": "text-centered",
            "textFontSize": 2,
            "textMarginTop": "1cqw",
            "layer": 4,
            "display": true
        },
        {
            "component": "iconRT",
            "id": "iconRT1",
            "icon-b": "[icon]",
            "width": "45%",
            "top": "32%",
            "right": "52%",
            "padding": "1cqw",
            "extraClasses": "glass-12",
            "circleColor": "#ffffff55",
            "title": "[sections.0.subtitle]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 1.8,
            "titleFontColor": "#3f3f3f",
            "text": "[sections.0.text]",
            "textFontSize": 1.2,
            "layer": 3,
            "display": true
        },
        {
            "component": "iconRT",
            "id": "iconRT2",
            "icon-b": "[icon]",
            "width": "45%",
            "top": "32%",
            "right": "3%",
            "padding": "1cqw",
            "extraClasses": "glass-12",
            "circleColor": "#ffffff55",
            "title": "[sections.1.subtitle]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 1.8,
            "titleFontColor": "#3f3f3f",
            "text": "[sections.1.text]",
            "textFontSize": 1.2,
            "layer": 3,
            "display": true
        },
        {
            "component": "iconRT",
            "id": "iconRT3",
            "icon-b": "[icon]",
            "width": "45%",
            "top": "63%",
            "right": "52%",
            "padding": "1cqw",
            "extraClasses": "glass-12",
            "circleColor": "#ffffff55",
            "title": "[sections.2.subtitle]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 1.8,
            "titleFontColor": "#3f3f3f",
            "text": "[sections.2.text]",
            "textFontSize": 1.2,
            "layer": 3,
            "display": true
        },
        {
            "component": "iconRT",
            "id": "iconRT4",
            "icon-b": "[icon]",
            "width": "45%",
            "top": "63%",
            "right": "3%",
            "padding": "1cqw",
            "extraClasses": "glass-12",
            "circleColor": "#ffffff55",
            "title": "[sections.3.subtitle]",
            "titleFontFamily": "Fira Sans",
            "titleFontWeight": "500",
            "titleFontSize": 1.8,
            "titleFontColor": "#3f3f3f",
            "text": "[sections.3.text]",
            "textFontSize": 1.2,
            "layer": 3,
            "display": true
        },
        {
            "component": "circle",
            "id": "circle1",
            "stopColor1": "#d65cb3",
            "stopColor2": "#a63a87",
            "width": "30%",
            "height": "30%",
            "top": "60%",
            "right": "35%",
            "layer": 1,
            "display": true
        }
    ]
]