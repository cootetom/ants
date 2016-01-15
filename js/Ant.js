/* jshint esversion:6 */
/* globals $ */

(function () {
	'use strict';

	var APP = window.App || {};

	APP.Ant = function (colony) {
		var self = {
				memory: APP.AntMemory(),
				el: $('<div class="ant"></div>')
			},
			availableDirections = {
				// These are in a specific order to define a complete turning circle.
				'UP': {'top': -APP.gridSquareSize, 'left': 0 },
				'UP_RIGHT': {'top': -APP.gridSquareSize, 'left': +APP.gridSquareSize },
				'RIGHT': {'top': 0, 'left': +APP.gridSquareSize },
				'DOWN_RIGHT': {'top': +APP.gridSquareSize, 'left': +APP.gridSquareSize },
				'DOWN': {'top': +APP.gridSquareSize, 'left': 0 },
				'DOWN_LEFT': {'top': +APP.gridSquareSize, 'left': -APP.gridSquareSize },
				'LEFT': {'top': 0, 'left': -APP.gridSquareSize },
				'UP_LEFT': {'top': -APP.gridSquareSize, 'left': -APP.gridSquareSize }
			};

		function getRandomDirection(possibleDirections) {
			if (possibleDirections.length === 1) {
				return possibleDirections[0];
			}

			return possibleDirections[APP.getRandomInt(0, possibleDirections.length)];
		}

		function sliceWrap(array, chunk, offset) {
			var subarray = [];
			for (let i = 0; i < chunk; i++) {
				let ind = (offset + i) % array.length;
				subarray.push(array[ind]);
			}

			return subarray;
		}

		function getTurnAroundDirection() {
			var directionNames = Object.keys(availableDirections),
				oppositeIndex = directionNames.indexOf(self.memory.currentDirection) + 4;

			if (oppositeIndex >= directionNames.length) {
				oppositeIndex = oppositeIndex - directionNames.length;
			}

			return directionNames[oppositeIndex];
		}

		function getPossibleDirections(position) {
			var directions = Object.keys(availableDirections);

			if (self.memory.currentDirection) {
				// make sure we don't do a direct turn around but instead
				// create a restricted turning circle
				let index = directions.indexOf(self.memory.currentDirection) - 2;

				if (index < 0) {
					index = directions.length - Math.abs(index);
				}

				directions = sliceWrap(directions, 5, index);
			}

			directions = directions.filter(function (n) {
				// Don't want the ant to go outside the colony boundary
				return !(
					(position.left >= colony.boundary.right - APP.gridSquareSize && n.indexOf('RIGHT') >= 0) ||
					(position.left <= APP.gridSquareSize && n.indexOf('LEFT') >= 0) ||
					(position.top >= colony.boundary.bottom - APP.gridSquareSize && n.indexOf('DOWN') >= 0) ||
					(position.top <= APP.gridSquareSize && n.indexOf('UP') >= 0)
				);
			});

			// Ants can and will get stuck in corners so let them turn around if that is the case.
			if (directions.length === 0) {
				directions = [getTurnAroundDirection()];
			}

			return directions;
		}

		function createPositionFromDirection(currentPosition, direction) {
			var newPosition = {};

			Object.keys(availableDirections[direction]).forEach(function (k) {
				newPosition[k] = (currentPosition[k] + availableDirections[direction][k]) + 'px';
			});

			return {
				coords: newPosition,
				name: direction
			};
		}

		function takeFood() {
			var foodItemCount = self.memory.foodSource.foodCount;

			if (foodItemCount >= 0) {
				self.memory.foodSource.el
						  .removeClass('FOOD_' + (foodItemCount--))
						  .addClass('FOOD_' + foodItemCount);
				self.memory.foodSource.foodCount = foodItemCount;
			}

			if (foodItemCount < 0) {
				self.memory.foodSource = null;
				self.memory.carryingFood = false;
			} else {
				self.memory.carryingFood = true;
			}
		}

		function dropFood() {
			self.memory.carryingFood = false;
		}

		self.found = function (items, detectionRadius) {
			var isFound = false,
				antBox = APP.createBoxFromElement(self.el, detectionRadius);

			items.some(function (item) {
				if (APP.isCollision(antBox, item.box)) {
					isFound = item;
				}
				return !!isFound;
			});

			return isFound;
		};

		self.foundFood = function () {
			var someFood = self.found(colony.food);

			if (someFood) {
				self.memory.foodSource = someFood;
			}

			return !!someFood;
		};

		self.foundNest = function () {
			var aNest = self.found(colony.nests);

			if (aNest) {
				self.memory.nestSource= aNest;
			}

			return !!aNest;
		};

		self.createNextRandomPosition = function () {
			var currentPosition = self.el.position(),
				possibleDirections = getPossibleDirections(currentPosition),
				newDirection = getRandomDirection(possibleDirections);

			return createPositionFromDirection(currentPosition, newDirection);
		};

		self.createNextShortestPathPosition = function (start, end) {
			var distanceX = Math.floor((parseInt(end.left, 10) - parseInt(start.left, 10)) / APP.gridSquareSize),
				distanceY = Math.floor((parseInt(end.top, 10) - parseInt(start.top, 10)) / APP.gridSquareSize),
				direction = [];

			if (distanceY < 0) {
				direction.push('UP');
			} else if (distanceY > 0) {
				direction.push('DOWN');
			}

			if (distanceX < 0) {
				direction.push('LEFT');
			} else if (distanceX > 0) {
				direction.push('RIGHT');
			}

			return createPositionFromDirection(self.el.position(), direction.join('_'));
		}

		self.setPosition = function (position) {
			self.el.css(position.coords);
		  	self.memory.currentDirection = position.name;
			self.memory.coords = position.coords;
		};

		self.updateClasses = function () {
			var toRemove = ['HAS_FOOD', 'FOUND_FOOD_LOCATION', 'FOUND_NEST_LOCATION'],
				toAdd = [self.memory.currentDirection];

			toRemove = toRemove.concat(Object.keys(availableDirections));

			if (self.memory.carryingFood) {
				toAdd.push('HAS_FOOD');
			}

			if (self.memory.nestSource) {
				toAdd.push('FOUND_FOOD_LOCATION');
			}

			if (self.memory.nestSource) {
				toAdd.push('FOUND_NEST_LOCATION');
			}

			self.el.removeClass(toRemove.join(' '));
			self.el.addClass(toAdd.join(' '));
		};

		self.move = function () {
			if (self.memory.carryingFood && self.memory.nestSource) {
				if (self.found([self.memory.nestSource])) {
					dropFood();
				} else {
					let position = self.createNextShortestPathPosition(self.el.position(), self.memory.nestSource.el.position());
					self.setPosition(position);
				}

			} else if (!self.memory.carryingFood && self.memory.foodSource) {
				if (self.found([self.memory.foodSource])) {
					takeFood();
				} else {
					let position = self.createNextShortestPathPosition(self.el.position(), self.memory.foodSource.el.position());
					self.setPosition(position);
				}

			} else {
				let position = self.createNextRandomPosition();
				self.setPosition(position);

				self.foundNest(); // check

				if (self.foundFood()) {
					if (!self.memory.carryingFood) {
						takeFood();
					}
				}
			}

			self.updateClasses();
		};

		colony.addAnt(self, self.el);

		return self;
	};

})();
