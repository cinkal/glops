// 程序入口
Laya.init(720, 1280, Laya.WebGL);
Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
Laya.stage.scaleMode = "showall";
// Laya.stage.screenMode = "vertical";
Laya.stage.frameRate = Laya.Stage.FRAME_SLOW;
main();
function main() {
    Laya.stage.addChild(new laya.BlockControl());
}
//# sourceMappingURL=LayaUISample.js.map