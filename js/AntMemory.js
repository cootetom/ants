/* jshint esversion:6 */

(function () {
	'use strict';

	var APP = window.App || {};

	APP.AntMemory = function () {
		var self = {
				currentDirection: null,
				foodSource: null,
				foodSourceFoundAt: null,
				nestSource: null,
				carryingFood: false,
				previousKnowledgeShares: []
			};

		function swapInfo(key, friend) {
			if (friend.memory[key] && !self[key] && self.previousKnowledgeShares.indexOf(friend.memory[key]) < 0) {
				self[key] = friend.memory[key];
				self.previousKnowledgeShares.push(friend.memory[key]);
			} else if (self[key] && !friend.memory[key] && friend.memory.previousKnowledgeShares.indexOf(self[key]) < 0) {
				friend.memory[key] = self[key];
				friend.memory.previousKnowledgeShares.push(self[key]);
			}
		}

		self.communicateWithFriend = function (friend) {
			swapInfo('foodSource', friend);
			swapInfo('nestSource', friend);
		};

		self.communicateWithEnemy = function (enemy) {
			if (enemy.memory.carryingFood && !self.foodSourceFoundAt && !self.carryingFood) {
				self.foodSourceFoundAt = $.extend({}, enemy.box);
				self.carryingFood = true;
				enemy.memory.carryingFood = false;
			}
		};

		return self;
	};

})();
