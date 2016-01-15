(function () {
	'use strict';

	var APP = window.App || {};

	APP.RedAnt = function (colony) {
        var self = APP.Ant(colony);

        self.foundNest = function () {
			var aNest = self.found(colony.redAntNests);

			if (aNest) {
				self.memory.nestSource= aNest;
			}

			return !!aNest;
		};

        self.move = function () {
            if (self.memory.carryingFood && self.memory.nestSource) {
				if (self.found([self.memory.nestSource])) {
					self.memory.carryingFood = false;
				} else {
					let position = self.createNextShortestPathPosition(self.el.position(), self.memory.nestSource.el.position());
					self.setPosition(position);
				}

			} else if (!self.memory.carryingFood && self.memory.foodSourceFoundAt) {
				if (self.found([{box: self.memory.foodSourceFoundAt}])) {
					self.memory.foodSourceFoundAt = null;
				} else {
					let position = self.createNextShortestPathPosition(self.el.position(), self.memory.foodSourceFoundAt);
					self.setPosition(position);
				}

			} else {
	             let position = self.createNextRandomPosition();
		         self.setPosition(position);
                 self.foundNest(); // check
            }

			self.updateClasses();
		};

        self.isRedAnt = true;
        self.el.addClass('RED_ANT');

        return self;
    };
})();
