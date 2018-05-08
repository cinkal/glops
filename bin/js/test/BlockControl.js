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
var Handler = laya.utils.Handler;
var laya;
(function (laya) {
    var BlockControl = /** @class */ (function (_super) {
        __extends(BlockControl, _super);
        function BlockControl() {
            var _this = _super.call(this) || this;
            _this._removeList = new Array();
            _this._checkList = new Array();
            _this._useBlock = new Array();
            _this._posMap = {};
            _this._blockMap = {};
            _this._pointMap = {};
            _this._allIndex = 0;
            _this._checking = false;
            _this._IsFull = false;
            _this._filling = 0;
            _this._allCount = 0;
            _this._allCountLabel = null;
            _this._autoInit = true;
            _this._useTime = 5;
            _this._lineSprite = null;
            _this._overLabel = null;
            Laya.timer.frameLoop(1, _this, _this.update);
            _this.initData();
            return _this;
        }
        BlockControl.prototype.initData = function () {
            var oriPointX = 70;
            var oriPointY = 550;
            var array = [];
            for (var index = 1; index <= RANDOM_MAX; index++) {
                array.push(index);
            }
            for (var rowIndex = 0; rowIndex < BLOCK_MAX_ROW; rowIndex++) {
                var lastRowIndex = -1;
                for (var colIndex = 0; colIndex < BLOCK_MAX_COL; colIndex++) {
                    var pos = getPosIndex(rowIndex, colIndex);
                    var pointX = colIndex * (BLOCK_WIDTH + BLOCK_ROW_INTERVAL) + oriPointX;
                    var pointY = rowIndex * (BLOCK_HEIGHT + BLOCK_COL_INTERVAL) + oriPointY;
                    this._pointMap[pos.toString()] = new Laya.Point(pointX, pointY);
                    var block = this.addBolck(pos);
                    this._blockMap[pos.toString()] = block;
                    var lastColIndex = -1;
                    var lastColBlock = this.getBlock(rowIndex - 1, colIndex);
                    if (lastColBlock) {
                        lastColIndex = array.indexOf(lastColBlock._count);
                    }
                    var r = this.getRandomIndex(lastRowIndex, lastColIndex);
                    lastRowIndex = r;
                    block.setCountLabel(array[r]);
                    block.pos(pointX, pointY);
                    this.addChild(block);
                }
                //add use block sprite
                var tempX_1 = rowIndex * (BLOCK_WIDTH + BLOCK_COL_INTERVAL) + oriPointX;
                var tempY_1 = oriPointY - BLOCK_HEIGHT / 2 - 10;
                var tempSprite = new Laya.Sprite();
                tempSprite.size(BLOCK_WIDTH, BLOCK_HEIGHT / 3);
                tempSprite.graphics.drawRect(0, 0, BLOCK_WIDTH, BLOCK_HEIGHT / 3, "#EA0000");
                tempSprite.pos(tempX_1, tempY_1);
                this.addChild(tempSprite);
                this._useBlock.push(tempSprite);
            }
            this._lineSprite = new Laya.Sprite();
            var tempX = this._useBlock[0].x;
            var tempY = this._useBlock[0].y + this._useBlock[0].height + 10;
            var width = (BLOCK_WIDTH + BLOCK_COL_INTERVAL) * BLOCK_MAX_COL - BLOCK_COL_INTERVAL;
            this._lineSprite.size(width, 5);
            this._lineSprite.graphics.drawLine(tempX, tempY, tempX + width, tempY, "#FFFF37", 2);
            // this._lineSprite.pos(tempX, tempY);
            this.addChild(this._lineSprite);
            this.setGameOver();
            this.addActivityCount(0);
            // this.initNewData();
        };
        BlockControl.prototype.findGlopsBlock = function (pos, hasCheckList, findList) {
            this._allIndex++;
            var row = getRow(pos);
            var col = getCol(pos);
            var block = this.getBlock(row, col);
            var temp = this.getBlock(row - 1, col); //up
            var tempPos = getPosIndex(row - 1, col);
            if (temp && hasCheckList.indexOf(tempPos) < 0 && findList.indexOf(tempPos) < 0) {
                hasCheckList.push(tempPos);
                if (this.isSameBlock(block, temp)) {
                    findList.push(tempPos);
                    this.findGlopsBlock(tempPos, hasCheckList, findList);
                }
            }
            temp = this.getBlock(row + 1, col); //down
            tempPos = getPosIndex(row + 1, col);
            if (temp && hasCheckList.indexOf(tempPos) < 0 && findList.indexOf(tempPos) < 0) {
                hasCheckList.push(tempPos);
                if (this.isSameBlock(block, temp)) {
                    findList.push(tempPos);
                    this.findGlopsBlock(tempPos, hasCheckList, findList);
                }
            }
            temp = this.getBlock(row, col - 1); //down
            tempPos = getPosIndex(row, col - 1);
            if (temp && hasCheckList.indexOf(tempPos) < 0 && findList.indexOf(tempPos) < 0) {
                hasCheckList.push(tempPos);
                if (this.isSameBlock(block, temp)) {
                    findList.push(tempPos);
                    this.findGlopsBlock(tempPos, hasCheckList, findList);
                }
            }
            temp = this.getBlock(row, col + 1); //down
            tempPos = getPosIndex(row, col + 1);
            if (temp && hasCheckList.indexOf(tempPos) < 0 && findList.indexOf(tempPos) < 0) {
                hasCheckList.push(tempPos);
                if (this.isSameBlock(block, temp)) {
                    findList.push(tempPos);
                    this.findGlopsBlock(tempPos, hasCheckList, findList);
                }
            }
        };
        BlockControl.prototype.checkBlock = function (pos, isAdd) {
            var hasCheckList = new Array();
            var findList = new Array();
            var row = getRow(pos);
            var col = getCol(pos);
            var block = this.getBlock(row, col);
            if (!block)
                return true;
            this.findGlopsBlock(pos, hasCheckList, findList);
            if (findList.length < GLOPS_STEP)
                return true;
            var addCount = block._count * findList.length;
            var moveDownList = new Array();
            var remainIndex = -1;
            for (var index = 0; index < findList.length; index++) {
                var findPos = findList[index];
                if (remainIndex == -1 && this.checkCanRemain(findPos, findList)) {
                    remainIndex = index;
                    moveDownList.push(findPos);
                }
                this.checkWillMoveDownPos(findPos, moveDownList, findList);
                var findRow = getRow(findPos);
                var findCol = getCol(findPos);
                var block_1 = this.getBlock(findRow, findCol);
                if (!block_1)
                    continue;
                //set removeList
                //delete blockMap
                if (index != remainIndex) {
                    this.removeBlock(findRow, findCol);
                }
                //play out action
                block_1.doRemoveAction(Laya.Handler.create(this, function removeCallBack(b, isRemain, isLast) {
                    if (b) {
                        if (!isRemain) {
                            b.visible = false;
                        }
                        else {
                            b.addCount(1);
                            b.doShowAction();
                        }
                        if (isLast) {
                            this.afterAllmove(moveDownList);
                        }
                    }
                }, [block_1, (index == remainIndex), (index == findList.length - 1)]));
            }
            if (isAdd) {
                this.addActivityCount(addCount);
                this.addTime();
            }
            if (moveDownList.length <= 0)
                return true;
            return false;
            //add new block to map
        };
        BlockControl.prototype.afterAllmove = function (moveDownList) {
            if (!moveDownList || moveDownList.length <= 0)
                return true;
            //moveing desc
            moveDownList.sort();
            //block auto move down
            for (var index = moveDownList.length - 1; index >= 0; index--) {
                var movePos = moveDownList[index];
                var endPos = this.checkCanMoveDownPos(movePos);
                var row = getRow(movePos);
                var col = getCol(movePos);
                var block = this.getBlock(row, col);
                if (!block)
                    continue;
                var endPoint = this.getPoint(endPos);
                if (!endPoint)
                    continue;
                this.exchangeBlock(movePos, endPos); //exchange data
                this.addCheck(endPos); //new pos must check
                if (index == 0) {
                    block.moveDown(endPos, endPoint, Laya.Handler.create(this, function moveDownCallBack() {
                        //after move will check again
                        this._checking = false;
                    }));
                }
                else {
                    block.moveDown(endPos, endPoint);
                }
            }
            return false;
        };
        BlockControl.prototype.getBlock = function (row, col) {
            var key = getPosIndex(row, col).toString();
            if (this._blockMap[key])
                return this._blockMap[key];
            return null;
        };
        BlockControl.prototype.removeBlock = function (row, col) {
            var key = getPosIndex(row, col).toString();
            if (this._blockMap[key]) {
                this._removeList.push(this._blockMap[key]);
                this._blockMap[key] = null;
                this._IsFull = false;
            }
        };
        BlockControl.prototype.exchangeBlock = function (targetPos, endPos) {
            if (targetPos == endPos)
                return;
            var endKey = endPos.toString();
            var endBlock = null;
            if (this._blockMap[endKey]) {
                endBlock = this._blockMap[endKey];
            }
            var targetKey = targetPos.toString();
            this._blockMap[endKey] = this._blockMap[targetKey];
            this._blockMap[targetKey] = endBlock;
        };
        BlockControl.prototype.isSameBlock = function (b1, b2) {
            if (b1 && b2 && b1._count == b2._count)
                return true;
            return false;
        };
        BlockControl.prototype.checkCanRemain = function (pos, findList) {
            var row = getRow(pos);
            var col = getCol(pos);
            var temp = this.getBlock(row + 1, col); //down
            var tempPos = getPosIndex(row + 1, col);
            if (!temp)
                return true; //do not have down one,it can remain
            if (temp && findList.indexOf(tempPos) < 0) {
                //the down will not remove,it can remain
                return true;
            }
            return false;
        };
        BlockControl.prototype.checkCanMoveDownPos = function (pos) {
            var row = getRow(pos);
            if (row >= BLOCK_MAX_ROW - 1)
                return pos; //the max row,can not move down
            var col = getCol(pos);
            var temp = this.getBlock(row + 1, col); //down
            if (temp)
                return pos; //if is not null,can not move down
            var tempPos = getPosIndex(row + 1, col);
            return this.checkCanMoveDownPos(tempPos);
        };
        BlockControl.prototype.checkWillMoveDownPos = function (pos, moveDownList, removeList) {
            var row = getRow(pos);
            var col = getCol(pos);
            var temp = this.getBlock(row - 1, col); //up
            var tempPos = getPosIndex(row - 1, col);
            if (temp && moveDownList.indexOf(tempPos) < 0 && removeList.indexOf(tempPos) < 0) {
                moveDownList.push(tempPos);
                this.checkWillMoveDownPos(tempPos, moveDownList, removeList);
            }
        };
        BlockControl.prototype.getPoint = function (pos) {
            var key = pos.toString();
            return this._pointMap[key];
        };
        BlockControl.prototype.printf = function (list) {
            for (var key in list) {
                if (list.hasOwnProperty(key)) {
                    var element = list[key];
                    if (element) {
                        console.log("key=" + key.toString() + ",value=" + element._pos.toString());
                    }
                    else {
                        console.log("key=" + key.toString() + ",value=null");
                    }
                }
            }
        };
        BlockControl.prototype.update = function () {
            if (this._checking || this._filling > 0)
                return;
            var nextPos = this.getNextCheck();
            if (nextPos == -1) {
                if (!this._IsFull)
                    this.fillFullBlocks();
                return;
            }
            this._checking = true;
            if (this.checkBlock(nextPos, !this._autoInit)) {
                this._checking = false;
            }
        };
        BlockControl.prototype.getNextCheck = function () {
            if (this._checkList && this._checkList.length > 0) {
                return this._checkList.shift();
            }
            return -1;
        };
        BlockControl.prototype.addCheck = function (pos) {
            this._checkList.push(pos);
        };
        BlockControl.prototype.fillFullBlocks = function () {
            for (var key in this._blockMap) {
                if (this._blockMap.hasOwnProperty(key)) {
                    var block = this._blockMap[key];
                    if (block)
                        continue;
                    var pos = parseInt(key);
                    var point = this.getPoint(pos);
                    if (!point)
                        continue;
                    block = this.addBolck(pos);
                    block.pos(point.x, point.y); //start point y will be a final number
                    block.alpha = 0;
                    this.addCheck(pos); //new pos must check
                    this._filling++;
                    block.doShowAction(Laya.Handler.create(this, function fillCallBack() {
                        this._filling--;
                    }));
                    // block.moveDown(pos, point, Laya.Handler.create(this, function fillCallBack() : void {
                    // 	this._filling --;
                    // }));
                }
            }
            this._IsFull = true;
        };
        BlockControl.prototype.addBolck = function (pos) {
            var ret = null;
            if (this._removeList && this._removeList.length > 0) {
                ret = this._removeList.shift();
                ret.reset(random(1, RANDOM_MAX), pos);
            }
            else {
                ret = laya.Block.create(random(1, RANDOM_MAX), pos);
            }
            this._blockMap[pos.toString()] = ret;
            return ret;
        };
        BlockControl.prototype.addActivityCount = function (count) {
            if (!this._allCountLabel) {
                this._allCountLabel = new Laya.Label();
                this._allCountLabel.size(20, 20);
                this._allCountLabel.fontSize = 40;
                this._allCountLabel.color = "#ffffff";
                this._allCountLabel.pos(this.width / 2 - 50, 50);
                this.addChild(this._allCountLabel);
            }
            if (count >= 1) {
                this._allCount += 1;
                this._allCountLabel.text = "Your count:" + this._allCount.toString();
                count -= 1;
                Laya.timer.frameLoop(1, this, this.addActivityCount, [count]);
            }
            else {
                this._allCountLabel.text = "Your count:" + this._allCount.toString();
            }
        };
        //create one map, can not remove
        BlockControl.prototype.initNewData = function () {
            var array = [1, 2, 3];
            for (var rowIndex = 0; rowIndex < BLOCK_MAX_ROW; rowIndex++) {
                var lastRowIndex = -1;
                for (var colIndex = 0; colIndex < BLOCK_MAX_COL; colIndex++) {
                    var pos = getPosIndex(rowIndex, colIndex);
                    var lastColIndex = -1;
                    var lastColBlock = this.getBlock(rowIndex - 1, colIndex);
                    if (lastColBlock) {
                        lastColIndex = array.indexOf(lastColBlock._count);
                    }
                    var r = this.getRandomIndex(lastRowIndex, lastColIndex);
                    var block = this.getBlock(rowIndex, colIndex);
                    if (block) {
                        block.setCountLabel(array[r]);
                    }
                    lastRowIndex = r;
                }
            }
        };
        BlockControl.prototype.getRandomIndex = function (lastRowIndex, lastColIndex) {
            var array = new Array();
            for (var index = 0; index < RANDOM_MAX; index++) {
                if (index == lastRowIndex || index == lastColIndex)
                    continue;
                array.push(index);
            }
            return array[random(0, array.length - 1)];
        };
        BlockControl.prototype.useTime = function () {
            if (this._useTime > 0) {
                this._useTime--;
                this._useBlock[this._useTime].visible = false;
                return true;
            }
            else {
                return false;
            }
        };
        BlockControl.prototype.addTime = function () {
            if (this._useTime < BLOCK_MAX_ROW) {
                this._useBlock[this._useTime].visible = true;
                this._useTime++;
            }
            return true;
        };
        BlockControl.prototype.setGameOver = function () {
            if (!this._overLabel) {
                this._overLabel = new Laya.Label();
                this._overLabel.size(300, 300);
                this._overLabel.fontSize = 100;
                this._overLabel.color = "#FFFFFF";
                this._overLabel.pos(100, 150);
                this._overLabel.text = "Game Over!";
                this._overLabel.zOrder = 10;
                this.addChild(this._overLabel);
            }
        };
        return BlockControl;
    }(Laya.View));
    laya.BlockControl = BlockControl;
})(laya || (laya = {}));
function getPosIndex(row, col) {
    return (row + 1) * 10000 + col;
}
function getRow(pos) {
    return Math.floor(pos / 10000) - 1;
}
function getCol(pos) {
    return Math.floor(pos % 10000);
}
function random(min, max) {
    return Math.round(Math.random() * 100) % (max - min + 1) + min;
}
function getColor(count) {
    var ret = "";
    switch (count) {
        case 1:
            ret = "#C4C400";
            break;
        case 2:
            ret = "#73BF00";
            break;
        case 3:
            ret = "#00CACA";
            break;
        case 4:
            ret = "#0080FF";
            break;
        case 5:
            ret = "#921AFF";
            break;
        case 6:
            ret = "#FF00FF";
            break;
        case 7:
            ret = "#D200D2";
            break;
        case 8:
            ret = "#D26900";
            break;
        default:
            ret = "#8E8E8E";
            break;
    }
    return ret;
}
var BLOCK_WIDTH = 100;
var BLOCK_HEIGHT = 100;
var BLOCK_ROW_INTERVAL = 20;
var BLOCK_COL_INTERVAL = 20;
var BLOCK_MAX_ROW = 5;
var BLOCK_MAX_COL = 5;
var GLOPS_STEP = 3;
var RANDOM_MAX = 5;
//# sourceMappingURL=BlockControl.js.map