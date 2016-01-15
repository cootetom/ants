/* jshint esversion:6 */
/* globals $ */

window.App = (function () {
	'use strict';

	var self = {
			gridSquareSize: 10
		},
		ants = [],
		redAnts = [],
		tickers = [];

	function getParameterByName(name) {
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
		results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}

	function buildColony() {
		self.colony = self.Colony();
	}

	function buildAnts() {
		var requestedAnts = getParameterByName('ants'),
			numAnts = (requestedAnts) ? parseInt(requestedAnts, 10) : 300;

		for (let i = 0; i < numAnts; i++) {
			ants.push(self.Ant(self.colony));
		}
	}

	function buildRedAnts() {
		var requestedAnts = getParameterByName('redAnts'),
			numAnts = (requestedAnts) ? parseInt(requestedAnts, 10) : 30;

		for (let i = 0; i < numAnts; i++) {
			ants.push(self.RedAnt(self.colony));
		}
	}

	function expandBox(box, expansion) {
		box.top -= expansion;
		box.left -= expansion;
		box.right += expansion;
		box.bottom += expansion;
		return box;
	}

	function initiate() {
		buildColony();
		buildAnts();
		buildRedAnts();
		self.start();
	}

	self.isCollision = function (box1, box2) {
		return (box1.left < box2.right &&
				box1.right > box2.left &&
				box1.top < box2.bottom &&
				box1.bottom > box2.top);
	};

	self.createBoxFromCoords = function (coords, width, expansion) {
		var box = {
				top: parseInt(coords.top, 10),
				left: parseInt(coords.left, 10),
				right: parseInt(coords.left, 10) + width,
				bottom: parseInt(coords.top, 10) + width
			};

		if (expansion) {
			return expandBox(box, expansion);
		} else {
			return box;
		}
	};

	self.createBoxFromElement = function (el, expansion) {
		var position = el.position(),
			box = {
				top: position.top,
				left: position.left,
				right: position.left + el.width(),
				bottom: position.top + el.height()
			};

		if (expansion) {
			return expandBox(box, expansion);
		} else {
			return box;
		}
	};

	// Returns a random integer between min (included) and max (excluded)
	self.getRandomInt = function (min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	};

	self.roundToGrid = function (n) {
		return n - n % self.gridSquareSize;
	};

	self.start = function () {
		ants.forEach(function (ant) {
			tickers.push(window.setInterval(ant.move, 500));
		});

		tickers.push(window.setInterval(self.colony.findAntNeighbours, 500));
	};

	self.stop = function () {
		while (tickers.length) {
			window.clearInterval(tickers.pop());
		}
	};

	$(initiate);

	return self;
})();
