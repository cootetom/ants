/* jshint esversion:6 */
/* globals $ */

(function () {
	'use strict';

	var APP = window.App || {};

	APP.Colony = function () {
		var self = {
				boundary: {},
				nests: [],
				food: [],
				ants: [],
				redAntNests: []
			},
			el = $('<div id="colony"></div>'),
			foodDetectionRadius = APP.gridSquareSize,
			nestDetectionRadius = APP.gridSquareSize * 2,
			friendDectionRadius = APP.gridSquareSize;

		function placeItem(name, coords) {
			var item = $('<div></div>');

			item.addClass(name).appendTo(el);

			coords.top = coords.top - item.height();
			coords.left = coords.left - item.width();
			item.css(coords);

			return item;
		}

		function showCollisionBoxBoundary(box) {
			var boxEl = $('<div />');

			boxEl.css({
				top: box.top + 'px',
				left: box.left + 'px',
				height: (box.bottom - box.top) + 'px',
				width: (box.right - box.left) + 'px',
				border: '1px solid #F8F8F8',
				position: 'absolute'
			}).appendTo(el);
		}

		function placeFood(coords) {
			var el = placeItem('food', coords).addClass('FOOD_25'),
				obj = {
					el: el,
					box: APP.createBoxFromElement(el, foodDetectionRadius),
					foodCount: 25
				};

			self.food.push(obj);
			showCollisionBoxBoundary(obj.box);
		}

		function placeNest(coords) {
			var el = placeItem('nest', coords),
				obj = {
				el: el,
					box: APP.createBoxFromElement(el, nestDetectionRadius)
				};

			self.nests.push(obj);
			showCollisionBoxBoundary(obj.box);
		}

		function placeRedAntNest(coords) {
			var el = placeItem('nest', coords).addClass('RED_ANT_NEST'),
				obj = {
				el: el,
					box: APP.createBoxFromElement(el, nestDetectionRadius)
				};

			self.redAntNests.push(obj);
			showCollisionBoxBoundary(obj.box);
		}

		function handleColonyClick(event) {
			var coords = {
					top: event.offsetY,
					left: event.offsetX
				};

			if (event.ctrlKey) {
				placeNest(coords);
			} else if (event.altKey) {
				placeRedAntNest(coords);
			} else {
				placeFood(coords);
			}
		}

		self.findAntNeighbours = function () {
			self.ants.forEach(function (ant, index) {
				let antBox = index > 0 ? ant.box : APP.createBoxFromCoords(ant.memory.coords, 6, friendDectionRadius);

				for (let i = index + 1; i < self.ants.length; i++) {
					let possibleAntFriend = self.ants[i];

					if (index === 0) {
						possibleAntFriend.box = APP.createBoxFromCoords(possibleAntFriend.memory.coords, 6, friendDectionRadius);
					}

					if (APP.isCollision(antBox, possibleAntFriend.box)) {
						if (ant.isRedAnt && !possibleAntFriend.isRedAnt) {
							ant.memory.communicateWithEnemy(possibleAntFriend);
						} else {
							ant.memory.communicateWithFriend(possibleAntFriend);
						}
					}
				}
			});
		};

		self.addAnt = function (ant) {
			el.append(ant.el);

			ant.el.css({
				'top': APP.roundToGrid(APP.getRandomInt(self.boundary.top, self.boundary.bottom)) + 'px',
				'left': APP.roundToGrid(APP.getRandomInt(self.boundary.left, self.boundary.right)) + 'px'
			});

			self.ants.push(ant);
		};

		$(document.body).append(el);

		self.boundary = {
			top: 0,
			left: 0,
			bottom: APP.roundToGrid(el.height()),
			right: APP.roundToGrid(el.width())
		};

		el.on('click', handleColonyClick);

		return self;
	};

})();
