/**
* name 
*/
import Handler = laya.utils.Handler;

module laya{
	export class BlockControl extends Laya.View{
		private _posMap:any;
		private _blockMap:any;//{pos:Block}
		private _pointMap:any;
		private _allIndex:number;
		private _removeList:Array<Block>;
		private _checking:boolean;
		private _checkList:Array<number>;
		private _IsFull:boolean;
		private _filling:number;
		private _allCount:number;
		private _allCountLabel:Laya.Label;
		public _autoInit:boolean

		constructor(){
			super();
			this._removeList = new Array<Block>();
			this._checkList = new Array<number>();
			this._posMap = {};
			this._blockMap = {};
			this._pointMap = {};
			this._allIndex = 0;
			this._checking = false;
			this._IsFull = false;
			this._filling = 0;
			this._allCount = 0;
			this._allCountLabel = null;
			this._autoInit = true;

			Laya.timer.frameLoop(1, this, this.update);
			this.initData();
		}

		public initData() : void {
			let oriPointX = 70;
			let oriPointY = 550;
			let array = [1, 2, 3];
			for (let rowIndex = 0; rowIndex < BLOCK_MAX_ROW; rowIndex++) {
				let lastRowIndex = -1;
				for (let colIndex = 0; colIndex < BLOCK_MAX_COL; colIndex++) {
					let pos = getPosIndex(rowIndex, colIndex);

					let pointX = colIndex * (BLOCK_WIDTH + BLOCK_ROW_INTERVAL) + oriPointX;
					let pointY = rowIndex * (BLOCK_HEIGHT + BLOCK_COL_INTERVAL) + oriPointY;
					this._pointMap[pos.toString()] = new Laya.Point(pointX, pointY);

					let block = this.addBolck(pos);
					this._blockMap[pos.toString()] = block;

					let lastColIndex = -1;
					let lastColBlock = this.getBlock(rowIndex - 1, colIndex);
					if (lastColBlock) {
						lastColIndex = array.indexOf(lastColBlock._count);
					}

					let r = this.getRandomIndex(lastRowIndex, lastColIndex);
					lastRowIndex = r;

					block.setCountLabel(array[r]);
					block.pos(pointX, pointY);
					this.addChild(block);
				}
			}

			this.addActivityCount(0);
			// this.initNewData();
		}

		public findGlopsBlock(pos:number, hasCheckList:Array<number>, findList:Array<number>) : void {
			this._allIndex ++;
			let row = getRow(pos);
			let col = getCol(pos);
			let block = this.getBlock(row, col);

			let temp = this.getBlock(row - 1, col);//up
			let tempPos = getPosIndex(row - 1, col);
			if (temp && hasCheckList.indexOf(tempPos) < 0 && findList.indexOf(tempPos) < 0) {
				hasCheckList.push(tempPos);
				if (this.isSameBlock(block, temp)) {
					findList.push(tempPos);
					this.findGlopsBlock(tempPos, hasCheckList, findList);
				}
			}

			temp = this.getBlock(row + 1, col);//down
			tempPos = getPosIndex(row + 1, col);
			if (temp && hasCheckList.indexOf(tempPos) < 0 && findList.indexOf(tempPos) < 0) {
				hasCheckList.push(tempPos);
				if (this.isSameBlock(block, temp)) {
					findList.push(tempPos);
					this.findGlopsBlock(tempPos, hasCheckList, findList);
				}
			}

			temp = this.getBlock(row, col - 1);//down
			tempPos = getPosIndex(row, col - 1);
			if (temp && hasCheckList.indexOf(tempPos) < 0 && findList.indexOf(tempPos) < 0) {
				hasCheckList.push(tempPos);
				if (this.isSameBlock(block, temp)) {
					findList.push(tempPos);
					this.findGlopsBlock(tempPos, hasCheckList, findList);
				}
			}

			temp = this.getBlock(row, col + 1);//down
			tempPos = getPosIndex(row, col + 1);
			if (temp && hasCheckList.indexOf(tempPos) < 0 && findList.indexOf(tempPos) < 0) {
				hasCheckList.push(tempPos);
				if (this.isSameBlock(block, temp)) {
					findList.push(tempPos);
					this.findGlopsBlock(tempPos, hasCheckList, findList);
				}
			}
		}

		private checkBlock(pos:number, isAdd?:boolean) : boolean {
			let hasCheckList = new Array<number>();
			let findList = new Array<number>();

			let row = getRow(pos);
			let col = getCol(pos);
			let block = this.getBlock(row, col);
			if (!block) return true;

			this.findGlopsBlock(pos, hasCheckList, findList);

			if (findList.length < GLOPS_STEP) return true;
			let addCount = block._count * findList.length;

			let moveDownList = new Array<number>();
			let remainIndex = -1;
			for (let index = 0; index < findList.length; index++) {
				let findPos = findList[index];
				if (remainIndex == -1 && this.checkCanRemain(findPos, findList)) {
 					remainIndex = index;
					moveDownList.push(findPos);
				}
				this.checkWillMoveDownPos(findPos, moveDownList, findList);

				let findRow = getRow(findPos);
				let findCol = getCol(findPos);
				let block = this.getBlock(findRow, findCol);
				if (!block) continue;

				//set removeList
				//delete blockMap
				if (index != remainIndex) {
					this.removeBlock(findRow, findCol);
				}

				//play out action
				block.doRemoveAction(Laya.Handler.create(this, function removeCallBack(b:Block, isRemain:boolean, isLast:boolean) : void {
					if (b) {
						if (!isRemain) {
							b.visible = false;
						}else {
							b.addCount(1);
							b.doShowAction();
						}

						if (isLast) {
							this.afterAllmove(moveDownList);
						}

					}
				}, [block, (index == remainIndex) , (index == findList.length - 1) ]));
			}

			if (isAdd) this.addActivityCount(addCount);

			if (moveDownList.length <= 0) return true;
			
			return false;
			//add new block to map
		}

		private afterAllmove(moveDownList:Array<number>) : boolean {
			if (!moveDownList || moveDownList.length <= 0) return true;
			//moveing desc
			moveDownList.sort();

			//block auto move down
			for (let index = moveDownList.length - 1; index >= 0; index--) {
				let movePos = moveDownList[index];
				let endPos = this.checkCanMoveDownPos(movePos);
				let row = getRow(movePos);
				let col = getCol(movePos);
				let block = this.getBlock(row, col);
				if (!block) continue;

				let endPoint = this.getPoint(endPos);
				if (!endPoint) continue;

				this.exchangeBlock(movePos, endPos);//exchange data
				this.addCheck(endPos); //new pos must check

				if (index == 0) {//the last one will call back
					block.moveDown(endPos, endPoint, Laya.Handler.create(this, function moveDownCallBack() : void {
						//after move will check again
						this._checking  = false;
					}));
				}else {
					block.moveDown(endPos, endPoint);
				}
			}
			return false;
		}

		private getBlock(row:number, col:number) : Block {
			let key = getPosIndex(row, col).toString();
			if (this._blockMap[key])
				return this._blockMap[key];
			return null;
		}

		private removeBlock(row:number, col:number) : void {
			let key = getPosIndex(row, col).toString();
			if (this._blockMap[key]) {
				this._removeList.push(this._blockMap[key]);
				this._blockMap[key] = null;
				this._IsFull = false;
			}
		}

		private exchangeBlock(targetPos:number, endPos:number) : void {
			if (targetPos == endPos) return;
			let endKey = endPos.toString();
			let endBlock = null;
			if (this._blockMap[endKey]) {
				endBlock = this._blockMap[endKey];
			}

			let targetKey = targetPos.toString();
			this._blockMap[endKey] = this._blockMap[targetKey];
			this._blockMap[targetKey] = endBlock;
		}

		private isSameBlock(b1:Block, b2:Block) : boolean {
			if (b1 && b2 && b1._count == b2._count)
				return true;
			return false;
		}

		private checkCanRemain(pos:number, findList:Array<number>) : boolean {
			let row = getRow(pos);
			let col = getCol(pos);
			let temp = this.getBlock(row + 1, col);//down
			let tempPos = getPosIndex(row + 1, col);
			if (!temp) return true;//do not have down one,it can remain

			if (temp && findList.indexOf(tempPos) < 0) {
				//the down will not remove,it can remain
				return true;
			}
			return false;
		}

		private checkCanMoveDownPos(pos:number) : number {
			let row = getRow(pos);
			if (row >= BLOCK_MAX_ROW - 1) return pos;//the max row,can not move down

			let col = getCol(pos);
			let temp = this.getBlock(row + 1, col);//down
			if (temp) return pos;//if is not null,can not move down

			let tempPos = getPosIndex(row + 1, col);
			return this.checkCanMoveDownPos(tempPos);

		}

		private checkWillMoveDownPos(pos:number, moveDownList:Array<number>, removeList:Array<number>) : void {
			let row = getRow(pos);
			let col = getCol(pos);
			let temp = this.getBlock(row - 1, col);//up
			let tempPos = getPosIndex(row - 1, col);
			if (temp && moveDownList.indexOf(tempPos) < 0 && removeList.indexOf(tempPos) < 0) {
				moveDownList.push(tempPos);
				this.checkWillMoveDownPos(tempPos, moveDownList, removeList);
			}
		}

		private getPoint(pos:number) : Laya.Point {
			let key = pos.toString();
			return this._pointMap[key];
		}

		private printf(list:any) : void {
			for (let key in list) {
				if (list.hasOwnProperty(key)) {
					let element = <Block>list[key];
					if (element) {
						console.log("key=" + key.toString() + ",value=" + element._pos.toString());
					}else {
						console.log("key=" + key.toString() + ",value=null");
					}
				}
			}
		}

		public update() : void {
			if (this._checking || this._filling > 0) return;

			let nextPos = this.getNextCheck();
			if (nextPos == -1) {
				if (!this._IsFull) this.fillFullBlocks();
				return;
			}

			this._checking = true;
			if (this.checkBlock(nextPos, !this._autoInit)) {
				this._checking = false;
			}

		}

		private getNextCheck() : number {
			if (this._checkList && this._checkList.length > 0) {
				return this._checkList.shift();
			}
			return -1;
		}

		public addCheck(pos:number) : void {
			this._checkList.push(pos);
		}

		public fillFullBlocks() : void {
			for (let key in this._blockMap) {
				if (this._blockMap.hasOwnProperty(key)) {
					let block = <Block>this._blockMap[key];
					if (block) continue;

					let pos = parseInt(key);
					let point = this.getPoint(pos);
					if (!point) continue;

					block = this.addBolck(pos);
					block.pos(point.x, -300);//start point y will be a final number
					this.addCheck(pos); //new pos must check

					this._filling ++;
					block.moveDown(pos, point, Laya.Handler.create(this, function fillCallBack() : void {
						this._filling --;
					}));
				}
			}

			this._IsFull = true;
		}

		private addBolck(pos:number) : Block {
			let ret:Block = null;
			if (this._removeList && this._removeList.length > 0) {
				ret = <Block>this._removeList.shift();
				ret.reset(random(1, 3), "#ffffff", pos);
			}else {
				ret = Block.create(random(1, 3), "#ffffff", pos);
			}
			this._blockMap[pos.toString()] = ret;
			return ret;
		}

		private addActivityCount(count:number) : void {
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
			}else {
				this._allCountLabel.text = "Your count:" + this._allCount.toString();
			}
		}

		//create one map, can not remove
		private initNewData() : void {
			let array = [1, 2, 3];
			for (let rowIndex = 0; rowIndex < BLOCK_MAX_ROW; rowIndex++) {
				let lastRowIndex = -1;
				for (let colIndex = 0; colIndex < BLOCK_MAX_COL; colIndex++) {
					let pos = getPosIndex(rowIndex, colIndex);

					let lastColIndex = -1;
					let lastColBlock = this.getBlock(rowIndex - 1, colIndex);
					if (lastColBlock) {
						lastColIndex = array.indexOf(lastColBlock._count);
					}

					let r = this.getRandomIndex(lastRowIndex, lastColIndex);

					let block = this.getBlock(rowIndex, colIndex);
					if (block) {
						block.setCountLabel(array[r]);
					}
					lastRowIndex = r;
				}
			}	
		}

		private getRandomIndex(lastRowIndex:number, lastColIndex:number) : number {
			let array = new Array<number>();
			for (let index = 0; index < 3; index++) {
				if (index == lastRowIndex || index == lastColIndex) continue;
				array.push(index);
			}
			return array[random(0, array.length - 1)];
		}

	}
}

function getPosIndex(row:number, col:number) : number {
	return (row + 1) * 10000 + col;
}

function getRow(pos:number) : number {
	return Math.floor(pos / 10000) - 1;
}

function getCol(pos:number) : number {
	return Math.floor(pos % 10000);
}

function random(min:number, max:number) : number {
	return Math.round(Math.random() * 100) % (max - min + 1) + min;
}


var BLOCK_WIDTH = 100;
var BLOCK_HEIGHT = 100;
var BLOCK_ROW_INTERVAL = 20;
var BLOCK_COL_INTERVAL = 20;
var BLOCK_MAX_ROW = 5;
var BLOCK_MAX_COL = 5;
var GLOPS_STEP = 3;