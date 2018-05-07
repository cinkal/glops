/**
* name 
*/
module laya{
	export class Block extends View{
		public _count:number;
		public _color:string;
		public _pos:number;
		private _icon:Laya.Sprite;
		private _label:Laya.Label;

		constructor(){
			super();
			this._count = 0;
			this._color = "#ffffff";
			this._pos = 0;
			this._icon = null;
			this._label = null;
		}

		public static create(count:number, color:string, pos:number) : Block {
			let ret = new Block();
			if (ret && ret.init(count, color, pos))
				return ret;
			
			ret = null;
			return null;
		}

		private init(count:number, color:string, pos:number) : boolean {
			let ret = false;
			while (!ret) {
				this._count = count;
				this._color = color;
				this._pos = pos;

				this._icon = new Laya.Sprite();
				this._icon.size(BLOCK_WIDTH, BLOCK_HEIGHT);
				this._icon.graphics.drawRect(0, 0, BLOCK_WIDTH, BLOCK_HEIGHT, this._color);
				this._icon.on(Laya.Event.MOUSE_DOWN, this, this.touchDown);
				this.addChild(this._icon);

				this._label = new Laya.Label();
				this._label.size(20, 20);
				this._label.fontSize = 20;
				this._label.pos(this._icon.width / 2 - 10, this._icon.height / 2 - 10);
				this._label.text = count.toString();
				this._icon.addChild(this._label);

				this.size(BLOCK_WIDTH, BLOCK_HEIGHT);

				ret = true;
			}

			return ret;
		}

		public reset() : void {
			this._count = 0;
			this._pos = 0;
			this._color = "";
			this.alpha = 1;
			this.updateView();
		}

		private touchDown(event:Event) : void {
			console.log("touchDown =====%d,", this._pos);
		}

		public updateView() : void {
			if (this._icon) {
				if (this._color == "") {
					this._icon.visible = false;
				}else {
					this._icon.graphics.clear();
					this._icon.graphics.drawRect(0, 0, BLOCK_WIDTH, BLOCK_HEIGHT, this._color);
				}
			}
			if (this._label) {
				this._label.text = this._count.toString();
			}
		}

		public doRemoveAction(callBack?:Handler) : void {
			Laya.Tween.to(this, {aipha:0}, 100, null, callBack);
		}

		public doShowAction(callBack?:Handler) : void {
			Laya.Tween.from(this, {aipha:1}, 100, null, callBack);
		}

		public addCount(count:number) : void {
			this._count += count;
			if (this._label) {
				this._label.text = this._count.toString();
			}
		}

		public moveDown(endPos:number, endPoint:Laya.Point, callBack?:Handler) : void {
			this._pos = endPos;
			Laya.Tween.to(this, {x:endPoint.x, y:endPoint.y}, 800, null, callBack);
		}
	}
}