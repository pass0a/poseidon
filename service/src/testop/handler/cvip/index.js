function Cvip() {
	var cvip = require('@passoa/cvip');
	this.imageMatch = function(img, tmp) {
		var result = cvip.imageMatch(img, tmp);
		return result;
	};
	this.imageSave = function(tmp, sim, cvfmt) {
		var result = cvip.imageSave(tmp, sim, cvfmt);
		return !result;
	};
	this.imageCut = function(tmp, sim, cvfmt, x, y, w, h) {
		var result = cvip.imageCut(tmp, sim, cvfmt, x, y, w, h);
		return result;
	};
}

export default new Cvip();
