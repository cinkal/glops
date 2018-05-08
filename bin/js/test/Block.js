var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
* name
*/
var laya;
(function (laya) {
    var Block = /** @class */ (function (_super) {
        __extends(Block, _super);
        function Block() {
            var _this = _super.call(this) || this;
            _this._count = 0;
            _this._color = "#ffffff";
            _this._pos = 0;
            _this._icon = null;
            _this._label = null;
            _this._touchCallBack = null;
            return _this;
        }
        Block.create = function (count, pos) {
            var ret = new Block();
            if (ret && ret.init(count, pos))
                return ret;
            ret = null;
            return null;
        };
        Block.prototype.init = function (count, pos) {
            var ret = false;
            while (!ret) {
                this._count = count;
                this._color = getColor(this._count);
                this._pos = pos;
                this._icon = new Laya.Sprite();
                this._icon.size(BLOCK_WIDTH, BLOCK_HEIGHT);
                this._icon.graphics.drawRect(0, 0, BLOCK_WIDTH, BLOCK_HEIGHT, this._color);
                this._icon.on(Laya.Event.MOUSE_DOWN, this, this.touchDown);
                this.addChild(this._icon);
                this._label = new Laya.Label();
                this._label.size(20, 20);
                this._label.fontSize = 50;
                this._label.color = "#FFFFFF";
                this._label.pos(this._icon.width / 2 - 15, this._icon.height / 2 - 25);
                this._label.text = count.toString();
                this._icon.addChild(this._label);
                this.size(BLOCK_WIDTH, BLOCK_HEIGHT);
                ret = true;
            }
            return ret;
        };
        Block.prototype.reset = function (count, pos) {
            this._count = count;
            this._pos = pos;
            this._color = getColor(this._count);
            this.alpha = 1;
            this.visible = true;
            this.pos(-1000, -1000);
            this.updateView();
        };
        Block.prototype.touchDown = function (event) {
            var control = (this.parent);
            if (control) {
                control._autoInit = false;
                if (!control.useTime())
                    return;
                this.addCount(1);
                control.addCheck(this._pos);
            }
        };
        Block.prototype.updateView = function () {
            if (this._icon) {
                if (this._color == "") {
                    this._icon.visible = false;
                }
                else {
                    this._icon.visible = true;
                    this._icon.graphics.clear();
                    this._icon.graphics.drawRect(0, 0, BLOCK_WIDTH, BLOCK_HEIGHT, this._color);
                }
            }
            if (this._label) {
                this._label.text = this._count.toString();
            }
        };
        Block.prototype.doRemoveAction = function (callBack) {
            Laya.Tween.to(this, { alpha: 0 }, 200, null, callBack);
        };
        Block.prototype.doShowAction = function (callBack) {
            Laya.Tween.to(this, { alpha: 1 }, 200, null, callBack);
        };
        Block.prototype.addCount = function (count) {
            this._count += count;
            this._color = getColor(this._count);
            this.updateView();
        };
        Block.prototype.moveDown = function (endPos, endPoint, callBack) {
            this._pos = endPos;
            Laya.Tween.to(this, { x: endPoint.x, y: endPoint.y }, 200, null, callBack);
        };
        Block.prototype.setCountLabel = function (count) {
            this._count = count;
            this._color = getColor(this._count);
            this.updateView();
        };
        return Block;
    }(Laya.View));
    laya.Block = Block;
})(laya || (laya = {}));
//# sourceMappingURL=Block.js.map