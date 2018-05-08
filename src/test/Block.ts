/**
* name 
*/
module laya{
	export class Block extends Laya.View{
		public _count:number;
		public _color:string;
		public _pos:number;
		private _icon:Laya.Sprite;
		private _label:Laya.Label;
		private _touchCallBack:Handler;

		constructor(){
			super();
			this._count = 0;
			this._color = "#ffffff";
			this._pos = 0;
			this._icon = null;
			this._label = null;
			this._touchCallBack = null;
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
				this._label.fontSize = 30;
				this._label.pos(this._icon.width / 2 - 10, this._icon.height / 2 - 10);
				this._label.text = count.toString();
				this._icon.addChild(this._label);

				this.size(BLOCK_WIDTH, BLOCK_HEIGHT);

				ret = true;
			}

			return ret;
		}

		public reset(count:number, color:string, pos:number) : void {
			this._count = count;
			this._pos = pos;
			this._color = color;
			this.alpha = 1;
			this.visible = true;
			this.pos(-1000, -1000);
			this.updateView();
		}

		private touchDown(event:Event) : void {
			let control = <BlockControl>(this.parent);
			if (control) {
				control._autoInit = false;
				this.addCount(1);
				control.addCheck(this._pos);
			}
		}

		public updateView() : void {
			if (this._icon) {
				if (this._color == "") {
					this._icon.visible = false;
				}else {
					this._icon.visible = true;
					this._icon.graphics.clear();
					this._icon.graphics.drawRect(0, 0, BLOCK_WIDTH, BLOCK_HEIGHT, this._color);
				}
			}
			if (this._label) {
				this._label.text = this._count.toString();
			}
		}

		public doRemoveAction(callBack?:Handler) : void {
			Laya.Tween.to(this, {alpha:0}, 500, null, callBack);
		}

		public doShowAction(callBack?:Handler) : void {
			Laya.Tween.to(this, {alpha:1}, 500, null, callBack);
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

		public setCountLabel(count:number) : void {
			this._count = count;
			if (this._label) {
				this._label.text = this._count.toString();
			}
		}
	}
}