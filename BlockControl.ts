/**
* name 
*/
module laya{
	export class BlockControl extends View{
		private _posMap:any;
		private _blockMap:any;//{pos:Block}
		private _pointMap:any;
		private _allIndex:number;
		private _removeList:Array<Block>;

		constructor(){
			super();
			this._removeList = new Array<Block>();
			this._posMap = {};
			this._blockMap = {};
			this._pointMap = {};
			this._allIndex = 0;

			this.initData();
		}

		public initData() : void {
			let oriPointX = 100;
			let oriPointY = 50;
			for (let rowIndex = 0; rowIndex < BLOCK_MAX_ROW; rowIndex++) {
				for (let colIndex = 0; colIndex < BLOCK_MAX_COL; colIndex++) {
					let pos = getPosIndex(rowIndex, colIndex);

					let pointX = colIndex * (BLOCK_WIDTH + BLOCK_ROW_INTERVAL) + oriPointX;
					let pointY = rowIndex * (BLOCK_HEIGHT + BLOCK_COL_INTERVAL) + oriPointY;
					this._pointMap[pos.toString()] = new Laya.Point(pointX, pointY);

					let block = Block.create(random(1, 3), "#ffffff", pos);
					this._blockMap[pos.toString()] = block;

					block.pos(pointX, pointY);
					this.addChild(block);
					console.log("row=%d,col=%d,count=%d,pos=%d",rowIndex, colIndex, block._count, pos);
				}
			}

			for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
				for (let colIndex = 0; colIndex < 5; colIndex++) {
					this.checkBlock(getPosIndex(rowIndex, colIndex));
				}
			}
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

		private checkBlock(pos:number) : void {
			let hasCheckList = new Array<number>();
			let findList = new Array<number>();

			let row = getRow(pos);
			let col = getCol(pos);
			let block = this.getBlock(row, col);
			if (!block) return;
			console.log("It will find block, row=%d, col=%d, pos=%d, count=%d", row, col, pos, block._count);

			this.findGlopsBlock(pos, hasCheckList, findList);

			console.log("============It find all blocks,all index=%d,find count=%d", this._allIndex, findList.length);

			let moveDownList = new Array<number>();
			let remainIndex = -1;
			for (let index = 0; index < findList.length; index++) {
				let findPos = findList[index];
				// console.log("findList,index=%d,findPos=%d",index, findPos);
				if (remainIndex == -1 && this.checkCanRemain(findPos, findList)) remainIndex = index;
				this.checkWillMoveDownPos(findPos, moveDownList, findList);

				// console.log("===========moveDownList.length=%d,index=%d,findPos=%d",moveDownList.length, index, findPos);

				let findRow = getRow(findPos);
				let findCol = getCol(findPos);
				let block = this.getBlock(findRow, findCol);
				if (!block) continue;

				//play out action
				block.doRemoveAction(Laya.Handler.create(this, function removeCallBack(b:Block) : void {
					if (b) {
						if (index != remainIndex) {
							b.visible = false;
							b.reset();
						}else {
							b.addCount(1);
							b.doShowAction();
						}
					}
				}, [block]));

				//set removeList
				//delete blockMap
				if (index != remainIndex) {
					this._removeList.push(block);
					this.removeBlock(findRow, findCol);
				}
			}

			let remainPos = -1;
			if (remainIndex != -1) {
				remainPos = findList[remainIndex];
				moveDownList.push(remainPos);
				// console.log("remain pos=%d", remainPos);
			}

			//block auto move down
			let checkList = new Array<number>();
			for (let index = 0; index < moveDownList.length; index++) {
				let movePos = moveDownList[index];
				let endPos = this.checkCanMoveDownPos(movePos);
				if (movePos == remainPos || endPos > movePos) {
					let row = getRow(movePos);
					let col = getCol(movePos);
					let block = this.getBlock(row, col);
					if (!block) continue;

					let endPoint = this.getPoint(endPos);
					if (!endPoint) continue;

					this.exchangeBlock(movePos, endPos);//exchange data
					checkList.push(endPos);

					if (index == moveDownList.length - 1) {//the last one will call back
						block.moveDown(endPos, endPoint, Laya.Handler.create(this, function moveDownCallBack() : void {
							//after move will check again
							this.printf(this._blockMap);
							// for (let checkIndex = 0; checkIndex < checkList.length; checkIndex++) {
							// 	let checkPos = checkList[checkIndex];
							// 	this.checkBlock(checkPos);
							// }
						}));
					}else {
						block.moveDown(endPos, endPoint);
					}
				}else {
					console.log("not move down,pos=%d,endPos=%d",movePos, endPos);
					// this.printf(this._blockMap);
				}
			}

			//add new block to map
		}

		private getBlock(row:number, col:number) : Block {
			let key = getPosIndex(row, col).toString();
			if (this._blockMap[key])
				return this._blockMap[key];
			return null;
		}

		private removeBlock(row:number, col:number) : void {
			let key = getPosIndex(row, col).toString();
			if (this._blockMap[key]) this._blockMap[key] = null;
		}

		private exchangeBlock(targetPos:number, endPos:number) : void {
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


var BLOCK_WIDTH = 50;
var BLOCK_HEIGHT = 50;
var BLOCK_ROW_INTERVAL = 20;
var BLOCK_COL_INTERVAL = 20;
var BLOCK_MAX_ROW = 5;
var BLOCK_MAX_COL = 5;