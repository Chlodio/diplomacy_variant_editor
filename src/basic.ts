const hexSym = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];


export default class Basic {
  public static rgbToHex(rgb:Array<number>){
    return Basic.digitRgbToHex(rgb[0])+Basic.digitRgbToHex(rgb[1])+Basic.digitRgbToHex(rgb[2])
  }

  public static digitRgbToHex(rgb:number){
    var t = rgb/16;
    var et = (t-(Math.floor(t)))/0.0625
    return hexSym[Math.floor(1+t)-1]+hexSym[Math.floor(et)];
  }

  public static hexToRGB(hex:string){
    return [
      Basic.digitHexToRGB(hex.substring(0,2)),
      Basic.digitHexToRGB(hex.substring(2,4)),
      Basic.digitHexToRGB(hex.substring(6,8)),
    ]
  }

  private static digitHexToRGB(hex:string){
    return (hexSym.indexOf(hex[0])*16)+hexSym.indexOf(hex[1])
  }

  static download(content:any, fileName:string, contentType:string) {
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(content)], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

}
