angular.module('weixin', ['ngTouch']).controller('MainCtrl', function() {
		var self = this;
		self.startedTime = new Date().getTime();
		self.stocks = [{
			name: 'First Stock',
			price: 100,
			previous: 220
		}, {
			name: 'Second Stock',
			price: 140,
			previous: 120
		}, {
			name: 'Third Stock',
			price: 110,
			previous: 110
		}, {
			name: 'Fourth Stock',
			price: 400,
			previous: 420
		}];

		self.point = {
			x: 400,
			y: 400
		}

	})
	.factory('Environment', function($window) {
		var winDimision = {
			width: $window.innerWidth
		};
		return {
			winDimision: winDimision
		}
	})
	.directive('tabs', ['Environment', '$swipe', function(Environment, $swipe) {
		return {
			restrict: 'E',
			transclude: true,
			scope: true,
			template: '<div class="tab-headers" id="tab-headers">' +
				'  <div ng-repeat="tab in tabs"' +
				'       class="tab-item"' +
				'       ng-click="selectTab($index)"' +
				'       id="{{\'tab\'+$index}}"' +
				'       ng-class="{selected: isSelectedTab($index)}">' +
				'	  <i style="font-size:2.5em;line-height:1em" ng-class="tab.icon"></i></br>' +
				'     <span ng-bind="tab.title"></span>' +
				'  </div>' +
				'</div>' +
				'<div class="tab-container" id="tab-container" ng-transclude></div> ',
			controller: function($scope) {
				var currentIndex = 0;
				$scope.tabs = [];

				$scope.selectTab = function(index, transition) {
					currentIndex = index;
					var tabs = document.querySelector('#tab-headers');
					var tabTransition = document.querySelector('#tabTransition');

					tabTransition.disabled = !transition;

					for (var i = 0; i < $scope.tabs.length; i++) {
						if (i === currentIndex) {
							$scope.tabs[i].scope.isShowed = true;
							$scope.tabs[i].scope.style["-webkit-transform"] = 'translate3d(0, 0, 0)';
							$scope.tabs[i].scope.style["opacity"] = 1;
						} else if ((i - 1) === currentIndex) {
							$scope.tabs[i].scope.isShowed = true;
							$scope.tabs[i].scope.style["-webkit-transform"] = 'translate3d(' + Environment.winDimision.width + 'px, 0, 0)';
							$scope.tabs[i].scope.style["opacity"] = 0;


						} else if ((i + 1) === currentIndex) {
							$scope.tabs[i].scope.isShowed = true;
							$scope.tabs[i].scope.style["-webkit-transform"] = 'translate3d(' + (-Environment.winDimision.width) + 'px, 0, 0)';
							$scope.tabs[i].scope.style["opacity"] = 0;

						} else {
							$scope.tabs[i].scope.isShowed = false;
						}
					}
				};
				$scope.isSelectedTab = function(index) {
					return currentIndex === index;
				};

				this.registerTab = function(title, icon, scope, element) {
					$scope.tabs.push({
						title: title,
						icon: icon,
						scope: scope
					});

					$scope.selectTab(0);
					var startX, endX, currentTab, leftTab, rightTab;

					$swipe.bind(element, {
						'start': function(coords, event) {
							currentTab = document.querySelector('#tab' + currentIndex);
							leftTab = document.querySelector('#tab' + (currentIndex - 1));
							rightTab = document.querySelector('#tab' + (currentIndex + 1));

							startX = coords.x;
						},
						'move': function(coords, event) {
							var xLength = coords.x - startX;
							var tabLen = $scope.tabs.length;
							if ((currentIndex === 0 && xLength > 0) || (currentIndex === (tabLen - 1) && xLength < 0)) {
								return;
							}

							var radiao = Math.abs(xLength / Environment.winDimision.width);

							var red = Math.floor(64 + (180 - 64) * radiao);
							var blue = Math.floor(169 + (180 - 169) * radiao);
							var green = Math.floor(17 + (180 - 17) * radiao);

							var nextRed=Math.floor(180- (180 - 64) * radiao);
							var nextBlue=Math.floor(180- (180 - 169) * radiao);
							var nextGreen=Math.floor(180- (180 - 17) * radiao);

							var nextTab=leftTab;
							if(xLength<0){
								nextTab=rightTab;
							}

							$scope.$apply(function() {
								currentTab.style.color = 'rgba(' + red + ',' + blue + ',' + green + ',1)';
								nextTab.style.color='rgba(' + nextRed + ',' + nextBlue + ',' + nextGreen + ',1)';
								for (var i = 0; i < tabLen; i++) {
									if ((i + 1) === currentIndex) {
										$scope.tabs[i].scope.style["opacity"] = Math.abs(xLength / Environment.winDimision.width);
										$scope.tabs[i].scope.style["-webkit-transform"] = 'translate3d(' + (-Environment.winDimision.width + xLength) + 'px, 0, 0)';
									} else if (i === currentIndex) {
										$scope.tabs[i].scope.style["opacity"] = 1 - Math.abs(xLength / Environment.winDimision.width);
										$scope.tabs[i].scope.style["-webkit-transform"] = 'translate3d(' + xLength + 'px, 0, 0)';
									} else if ((i - 1) === currentIndex) {
										$scope.tabs[i].scope.style["opacity"] = Math.abs(xLength / Environment.winDimision.width);
										$scope.tabs[i].scope.style["-webkit-transform"] = 'translate3d(' + (Environment.winDimision.width + xLength) + 'px, 0, 0)';
									}

								}
							});
						},
						'end': function(coords, event) {
							endX = coords.x;
							var distence = endX - startX;
							var tabLen = $scope.tabs.length;
							currentTab.style.color = '';
							$scope.$apply(function() {
								if ((currentIndex === 0 && distence > 0) || (currentIndex === (tabLen - 1) && distence < 0)) {
									$scope.selectTab(currentIndex, true);
									return;
								}
								if (Math.abs(distence) * 3 > Environment.winDimision.width) {
									if (distence > 0) {
										$scope.selectTab(currentIndex - 1, true);
									} else {
										$scope.selectTab(currentIndex + 1, true);
									}
								} else {
									$scope.selectTab(currentIndex, true);
								}
							});


						},
						'cancle': function() {
							$scope.selectTab(currentIndex, true);
						}
					}, ['touch']);

				};



			}
		};
	}])
	.directive('tab', ['Environment', function(Environment) {
		return {
			restrict: 'E',
			transclude: true,
			template: '<div class="tab-content"  ng-show="isShowed" ng-style="style" ng-transclude></div>',
			require: '^tabs',
			scope: true,
			link: function($scope, $element, $attr, tabCtrl) {
				$scope.style = {
					width: Environment.winDimision.width
				};
				var tabIndex = tabCtrl.registerTab($attr.title, $attr.icon, $scope, $element);

			}
		};
	}])
	.run(function() {

	});