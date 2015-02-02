(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if (typeof ijzerenhein === 'undefined') {
    ijzerenhein = {};
}

    window.ijzerenhein = ijzerenhein;

ijzerenhein.FlexScrollView = require('./src/FlexScrollView');
ijzerenhein.FlowLayoutNode = require('./src/FlowLayoutNode');
ijzerenhein.LayoutContext = require('./src/LayoutContext');
ijzerenhein.LayoutController = require('./src/LayoutController');
ijzerenhein.LayoutNode = require('./src/LayoutNode');
ijzerenhein.LayoutNodeManager = require('./src/LayoutNodeManager');
ijzerenhein.LayoutUtility = require('./src/LayoutUtility');
ijzerenhein.ScrollController = require('./src/ScrollController');
ijzerenhein.VirtualViewSequence = require('./src/VirtualViewSequence');
//ijzerenhein.ScrollView = require('./src/ScrollView');

ijzerenhein.widgets = ijzerenhein.widgets || {};
ijzerenhein.widgets.DatePicker = require('./src/widgets/DatePicker');
ijzerenhein.widgets.TabBar = require('./src/widgets/TabBar');

ijzerenhein.layout = ijzerenhein.layout || {};
ijzerenhein.layout.CollectionLayout = require('./src/layouts/CollectionLayout');
ijzerenhein.layout.CoverLayout = require('./src/layouts/CoverLayout');
ijzerenhein.layout.CubeLayout = require('./src/layouts/CubeLayout');
ijzerenhein.layout.GridLayout = require('./src/layouts/GridLayout');
ijzerenhein.layout.HeaderFooterLayout = require('./src/layouts/HeaderFooterLayout');
ijzerenhein.layout.ListLayout = require('./src/layouts/ListLayout');
ijzerenhein.layout.NavBarLayout = require('./src/layouts/NavBarLayout');
ijzerenhein.layout.ProportionalLayout = require('./src/layouts/ProportionalLayout');
ijzerenhein.layout.WheelLayout = require('./src/layouts/WheelLayout');

ijzerenhein.helpers = ijzerenhein.helpers || {};
ijzerenhein.helpers.LayoutDockHelper = require('./src/helpers/LayoutDockHelper');

},{"./src/FlexScrollView":2,"./src/FlowLayoutNode":3,"./src/LayoutContext":4,"./src/LayoutController":5,"./src/LayoutNode":6,"./src/LayoutNodeManager":7,"./src/LayoutUtility":8,"./src/ScrollController":9,"./src/VirtualViewSequence":10,"./src/helpers/LayoutDockHelper":11,"./src/layouts/CollectionLayout":12,"./src/layouts/CoverLayout":13,"./src/layouts/CubeLayout":14,"./src/layouts/GridLayout":15,"./src/layouts/HeaderFooterLayout":16,"./src/layouts/ListLayout":17,"./src/layouts/NavBarLayout":18,"./src/layouts/ProportionalLayout":19,"./src/layouts/WheelLayout":21,"./src/widgets/DatePicker":22,"./src/widgets/TabBar":24}],2:[function(require,module,exports){
var LayoutUtility = require('./LayoutUtility');
var ScrollController = require('./ScrollController');
var ListLayout = require('./layouts/ListLayout');
var PullToRefreshState = {
        HIDDEN: 0,
        PULLING: 1,
        ACTIVE: 2,
        COMPLETED: 3,
        HIDDING: 4
    };
function FlexScrollView(options) {
    ScrollController.call(this, LayoutUtility.combineOptions(FlexScrollView.DEFAULT_OPTIONS, options));
    this._thisScrollViewDelta = 0;
    this._leadingScrollViewDelta = 0;
    this._trailingScrollViewDelta = 0;
}
FlexScrollView.prototype = Object.create(ScrollController.prototype);
FlexScrollView.prototype.constructor = FlexScrollView;
FlexScrollView.PullToRefreshState = PullToRefreshState;
FlexScrollView.DEFAULT_OPTIONS = {
    layout: ListLayout,
    direction: undefined,
    paginated: false,
    alignment: 0,
    flow: false,
    mouseMove: false,
    useContainer: false,
    visibleItemThresshold: 0.5,
    pullToRefreshHeader: undefined,
    pullToRefreshFooter: undefined,
    leadingScrollView: undefined,
    trailingScrollView: undefined
};
FlexScrollView.prototype.setOptions = function (options) {
    ScrollController.prototype.setOptions.call(this, options);
    if (options.pullToRefreshHeader || options.pullToRefreshFooter || this._pullToRefresh) {
        if (options.pullToRefreshHeader) {
            this._pullToRefresh = this._pullToRefresh || [
                undefined,
                undefined
            ];
            if (!this._pullToRefresh[0]) {
                this._pullToRefresh[0] = {
                    state: PullToRefreshState.HIDDEN,
                    prevState: PullToRefreshState.HIDDEN,
                    footer: false
                };
            }
            this._pullToRefresh[0].node = options.pullToRefreshHeader;
        } else if (!this.options.pullToRefreshHeader && this._pullToRefresh) {
            this._pullToRefresh[0] = undefined;
        }
        if (options.pullToRefreshFooter) {
            this._pullToRefresh = this._pullToRefresh || [
                undefined,
                undefined
            ];
            if (!this._pullToRefresh[1]) {
                this._pullToRefresh[1] = {
                    state: PullToRefreshState.HIDDEN,
                    prevState: PullToRefreshState.HIDDEN,
                    footer: true
                };
            }
            this._pullToRefresh[1].node = options.pullToRefreshFooter;
        } else if (!this.options.pullToRefreshFooter && this._pullToRefresh) {
            this._pullToRefresh[1] = undefined;
        }
        if (this._pullToRefresh && !this._pullToRefresh[0] && !this._pullToRefresh[1]) {
            this._pullToRefresh = undefined;
        }
    }
    return this;
};
FlexScrollView.prototype.sequenceFrom = function (node) {
    return this.setDataSource(node);
};
FlexScrollView.prototype.getCurrentIndex = function getCurrentIndex() {
    var item = this.getFirstVisibleItem();
    return item ? item.viewSequence.getIndex() : -1;
};
FlexScrollView.prototype.goToPage = function goToPage(index) {
    var viewSequence = this._viewSequence;
    if (!viewSequence) {
        return this;
    }
    while (viewSequence.getIndex() < index) {
        viewSequence = viewSequence.getNext();
        if (!viewSequence) {
            return this;
        }
    }
    while (viewSequence.getIndex() > index) {
        viewSequence = viewSequence.getPrevious();
        if (!viewSequence) {
            return this;
        }
    }
    this.goToRenderNode(viewSequence.get());
    return this;
};
FlexScrollView.prototype.getOffset = function () {
    return this._scrollOffsetCache;
};
FlexScrollView.prototype.getPosition = FlexScrollView.prototype.getOffset;
function _setPullToRefreshState(pullToRefresh, state) {
    if (pullToRefresh.state !== state) {
        pullToRefresh.state = state;
        if (pullToRefresh.node && pullToRefresh.node.setPullToRefreshStatus) {
            pullToRefresh.node.setPullToRefreshStatus(state);
        }
    }
}
function _getPullToRefresh(footer) {
    return this._pullToRefresh ? this._pullToRefresh[footer ? 1 : 0] : undefined;
}
FlexScrollView.prototype._postLayout = function (size, scrollOffset) {
    if (!this._pullToRefresh) {
        return;
    }
    if (this.options.alignment) {
        scrollOffset += size[this._direction];
    }
    var prevHeight;
    var nextHeight;
    var totalHeight;
    for (var i = 0; i < 2; i++) {
        var pullToRefresh = this._pullToRefresh[i];
        if (pullToRefresh) {
            var length = pullToRefresh.node.getSize()[this._direction];
            var pullLength = pullToRefresh.node.getPullToRefreshSize ? pullToRefresh.node.getPullToRefreshSize()[this._direction] : length;
            var offset;
            if (!pullToRefresh.footer) {
                prevHeight = this._calcScrollHeight(false);
                prevHeight = prevHeight === undefined ? -1 : prevHeight;
                offset = prevHeight >= 0 ? scrollOffset - prevHeight : prevHeight;
                if (this.options.alignment) {
                    nextHeight = this._calcScrollHeight(true);
                    nextHeight = nextHeight === undefined ? -1 : nextHeight;
                    totalHeight = prevHeight >= 0 && nextHeight >= 0 ? prevHeight + nextHeight : -1;
                    if (totalHeight >= 0 && totalHeight < size[this._direction]) {
                        offset = Math.round(scrollOffset - size[this._direction] + nextHeight);
                    }
                }
            } else {
                nextHeight = nextHeight === undefined ? nextHeight = this._calcScrollHeight(true) : nextHeight;
                nextHeight = nextHeight === undefined ? -1 : nextHeight;
                offset = nextHeight >= 0 ? scrollOffset + nextHeight : size[this._direction] + 1;
                if (!this.options.alignment) {
                    prevHeight = prevHeight === undefined ? this._calcScrollHeight(false) : prevHeight;
                    prevHeight = prevHeight === undefined ? -1 : prevHeight;
                    totalHeight = prevHeight >= 0 && nextHeight >= 0 ? prevHeight + nextHeight : -1;
                    if (totalHeight >= 0 && totalHeight < size[this._direction]) {
                        offset = Math.round(scrollOffset - prevHeight + size[this._direction]);
                    }
                }
                offset = -(offset - size[this._direction]);
            }
            var visiblePerc = Math.max(Math.min(offset / pullLength, 1), 0);
            switch (pullToRefresh.state) {
            case PullToRefreshState.HIDDEN:
                if (this._scroll.scrollForceCount) {
                    if (visiblePerc >= 1) {
                        _setPullToRefreshState(pullToRefresh, PullToRefreshState.ACTIVE);
                    } else if (offset >= 0.2) {
                        _setPullToRefreshState(pullToRefresh, PullToRefreshState.PULLING);
                    }
                }
                break;
            case PullToRefreshState.PULLING:
                if (this._scroll.scrollForceCount && visiblePerc >= 1) {
                    _setPullToRefreshState(pullToRefresh, PullToRefreshState.ACTIVE);
                } else if (offset < 0.2) {
                    _setPullToRefreshState(pullToRefresh, PullToRefreshState.HIDDEN);
                }
                break;
            case PullToRefreshState.ACTIVE:
                break;
            case PullToRefreshState.COMPLETED:
                if (!this._scroll.scrollForceCount) {
                    if (offset >= 0.2) {
                        _setPullToRefreshState(pullToRefresh, PullToRefreshState.HIDDING);
                    } else {
                        _setPullToRefreshState(pullToRefresh, PullToRefreshState.HIDDEN);
                    }
                }
                break;
            case PullToRefreshState.HIDDING:
                if (offset < 0.2) {
                    _setPullToRefreshState(pullToRefresh, PullToRefreshState.HIDDEN);
                }
                break;
            }
            if (pullToRefresh.state !== PullToRefreshState.HIDDEN) {
                var contextNode = {
                        renderNode: pullToRefresh.node,
                        prev: !pullToRefresh.footer,
                        next: pullToRefresh.footer,
                        index: !pullToRefresh.footer ? --this._nodes._contextState.prevGetIndex : ++this._nodes._contextState.nextGetIndex
                    };
                var scrollLength;
                if (pullToRefresh.state === PullToRefreshState.ACTIVE) {
                    scrollLength = length;
                } else if (this._scroll.scrollForceCount) {
                    scrollLength = Math.min(offset, length);
                }
                var set = {
                        size: [
                            size[0],
                            size[1]
                        ],
                        translate: [
                            0,
                            0,
                            -0.001
                        ],
                        scrollLength: scrollLength
                    };
                set.size[this._direction] = Math.max(Math.min(offset, pullLength), 0);
                set.translate[this._direction] = pullToRefresh.footer ? size[this._direction] - length : 0;
                this._nodes._context.set(contextNode, set);
            }
        }
    }
};
FlexScrollView.prototype.showPullToRefresh = function (footer) {
    var pullToRefresh = _getPullToRefresh.call(this, footer);
    if (pullToRefresh) {
        _setPullToRefreshState(pullToRefresh, PullToRefreshState.ACTIVE);
        this._scroll.scrollDirty = true;
    }
};
FlexScrollView.prototype.hidePullToRefresh = function (footer) {
    var pullToRefresh = _getPullToRefresh.call(this, footer);
    if (pullToRefresh && pullToRefresh.state === PullToRefreshState.ACTIVE) {
        _setPullToRefreshState(pullToRefresh, PullToRefreshState.COMPLETED);
        this._scroll.scrollDirty = true;
    }
    return this;
};
FlexScrollView.prototype.isPullToRefreshVisible = function (footer) {
    var pullToRefresh = _getPullToRefresh.call(this, footer);
    return pullToRefresh ? pullToRefresh.state === PullToRefreshState.ACTIVE : false;
};
FlexScrollView.prototype.applyScrollForce = function (delta) {
    var leadingScrollView = this.options.leadingScrollView;
    var trailingScrollView = this.options.trailingScrollView;
    if (!leadingScrollView && !trailingScrollView) {
        return ScrollController.prototype.applyScrollForce.call(this, delta);
    }
    var partialDelta;
    if (delta < 0) {
        if (leadingScrollView) {
            partialDelta = leadingScrollView.canScroll(delta);
            this._leadingScrollViewDelta += partialDelta;
            leadingScrollView.applyScrollForce(partialDelta);
            delta -= partialDelta;
        }
        if (trailingScrollView) {
            partialDelta = this.canScroll(delta);
            ScrollController.prototype.applyScrollForce.call(this, partialDelta);
            this._thisScrollViewDelta += partialDelta;
            delta -= partialDelta;
            trailingScrollView.applyScrollForce(delta);
            this._trailingScrollViewDelta += delta;
        } else {
            ScrollController.prototype.applyScrollForce.call(this, delta);
            this._thisScrollViewDelta += delta;
        }
    } else {
        if (trailingScrollView) {
            partialDelta = trailingScrollView.canScroll(delta);
            trailingScrollView.applyScrollForce(partialDelta);
            this._trailingScrollViewDelta += partialDelta;
            delta -= partialDelta;
        }
        if (leadingScrollView) {
            partialDelta = this.canScroll(delta);
            ScrollController.prototype.applyScrollForce.call(this, partialDelta);
            this._thisScrollViewDelta += partialDelta;
            delta -= partialDelta;
            leadingScrollView.applyScrollForce(delta);
            this._leadingScrollViewDelta += delta;
        } else {
            ScrollController.prototype.applyScrollForce.call(this, delta);
            this._thisScrollViewDelta += delta;
        }
    }
    return this;
};
FlexScrollView.prototype.updateScrollForce = function (prevDelta, newDelta) {
    var leadingScrollView = this.options.leadingScrollView;
    var trailingScrollView = this.options.trailingScrollView;
    if (!leadingScrollView && !trailingScrollView) {
        return ScrollController.prototype.updateScrollForce.call(this, prevDelta, newDelta);
    }
    var partialDelta;
    var delta = newDelta - prevDelta;
    if (delta < 0) {
        if (leadingScrollView) {
            partialDelta = leadingScrollView.canScroll(delta);
            leadingScrollView.updateScrollForce(this._leadingScrollViewDelta, this._leadingScrollViewDelta + partialDelta);
            this._leadingScrollViewDelta += partialDelta;
            delta -= partialDelta;
        }
        if (trailingScrollView && delta) {
            partialDelta = this.canScroll(delta);
            ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, this._thisScrollViewDelta + partialDelta);
            this._thisScrollViewDelta += partialDelta;
            delta -= partialDelta;
            this._trailingScrollViewDelta += delta;
            trailingScrollView.updateScrollForce(this._trailingScrollViewDelta, this._trailingScrollViewDelta + delta);
        } else if (delta) {
            ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, this._thisScrollViewDelta + delta);
            this._thisScrollViewDelta += delta;
        }
    } else {
        if (trailingScrollView) {
            partialDelta = trailingScrollView.canScroll(delta);
            trailingScrollView.updateScrollForce(this._trailingScrollViewDelta, this._trailingScrollViewDelta + partialDelta);
            this._trailingScrollViewDelta += partialDelta;
            delta -= partialDelta;
        }
        if (leadingScrollView) {
            partialDelta = this.canScroll(delta);
            ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, this._thisScrollViewDelta + partialDelta);
            this._thisScrollViewDelta += partialDelta;
            delta -= partialDelta;
            leadingScrollView.updateScrollForce(this._leadingScrollViewDelta, this._leadingScrollViewDelta + delta);
            this._leadingScrollViewDelta += delta;
        } else {
            ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, this._thisScrollViewDelta + delta);
            this._thisScrollViewDelta += delta;
        }
    }
    return this;
};
FlexScrollView.prototype.releaseScrollForce = function (delta, velocity) {
    var leadingScrollView = this.options.leadingScrollView;
    var trailingScrollView = this.options.trailingScrollView;
    if (!leadingScrollView && !trailingScrollView) {
        return ScrollController.prototype.releaseScrollForce.call(this, delta, velocity);
    }
    var partialDelta;
    if (delta < 0) {
        if (leadingScrollView) {
            partialDelta = Math.max(this._leadingScrollViewDelta, delta);
            this._leadingScrollViewDelta -= partialDelta;
            delta -= partialDelta;
            leadingScrollView.releaseScrollForce(this._leadingScrollViewDelta, delta ? 0 : velocity);
        }
        if (trailingScrollView) {
            partialDelta = Math.max(this._thisScrollViewDelta, delta);
            this._thisScrollViewDelta -= partialDelta;
            delta -= partialDelta;
            ScrollController.prototype.releaseScrollForce.call(this, this._thisScrollViewDelta, delta ? 0 : velocity);
            this._trailingScrollViewDelta -= delta;
            trailingScrollView.releaseScrollForce(this._trailingScrollViewDelta, delta ? velocity : 0);
        } else {
            this._thisScrollViewDelta -= delta;
            ScrollController.prototype.releaseScrollForce.call(this, this._thisScrollViewDelta, delta ? velocity : 0);
        }
    } else {
        if (trailingScrollView) {
            partialDelta = Math.min(this._trailingScrollViewDelta, delta);
            this._trailingScrollViewDelta -= partialDelta;
            delta -= partialDelta;
            trailingScrollView.releaseScrollForce(this._trailingScrollViewDelta, delta ? 0 : velocity);
        }
        if (leadingScrollView) {
            partialDelta = Math.min(this._thisScrollViewDelta, delta);
            this._thisScrollViewDelta -= partialDelta;
            delta -= partialDelta;
            ScrollController.prototype.releaseScrollForce.call(this, this._thisScrollViewDelta, delta ? 0 : velocity);
            this._leadingScrollViewDelta -= delta;
            leadingScrollView.releaseScrollForce(this._leadingScrollViewDelta, delta ? velocity : 0);
        } else {
            this._thisScrollViewDelta -= delta;
            ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, delta ? velocity : 0);
        }
    }
    return this;
};
FlexScrollView.prototype.commit = function (context) {
    var result = ScrollController.prototype.commit.call(this, context);
    if (this._pullToRefresh) {
        for (var i = 0; i < 2; i++) {
            var pullToRefresh = this._pullToRefresh[i];
            if (pullToRefresh) {
                if (pullToRefresh.state === PullToRefreshState.ACTIVE && pullToRefresh.prevState !== PullToRefreshState.ACTIVE) {
                    this._eventOutput.emit('refresh', {
                        target: this,
                        footer: pullToRefresh.footer
                    });
                }
                pullToRefresh.prevState = pullToRefresh.state;
            }
        }
    }
    return result;
};
module.exports = FlexScrollView;
},{"./LayoutUtility":8,"./ScrollController":9,"./layouts/ListLayout":17}],3:[function(require,module,exports){
(function (global){
var OptionsManager = typeof window !== 'undefined' ? window.famous.core.OptionsManager : typeof global !== 'undefined' ? global.famous.core.OptionsManager : null;
var Transform = typeof window !== 'undefined' ? window.famous.core.Transform : typeof global !== 'undefined' ? global.famous.core.Transform : null;
var Vector = typeof window !== 'undefined' ? window.famous.math.Vector : typeof global !== 'undefined' ? global.famous.math.Vector : null;
var Particle = typeof window !== 'undefined' ? window.famous.physics.bodies.Particle : typeof global !== 'undefined' ? global.famous.physics.bodies.Particle : null;
var Spring = typeof window !== 'undefined' ? window.famous.physics.forces.Spring : typeof global !== 'undefined' ? global.famous.physics.forces.Spring : null;
var PhysicsEngine = typeof window !== 'undefined' ? window.famous.physics.PhysicsEngine : typeof global !== 'undefined' ? global.famous.physics.PhysicsEngine : null;
var LayoutNode = require('./LayoutNode');
var Transitionable = typeof window !== 'undefined' ? window.famous.transitions.Transitionable : typeof global !== 'undefined' ? global.famous.transitions.Transitionable : null;
function FlowLayoutNode(renderNode, spec) {
    LayoutNode.apply(this, arguments);
    if (!this.options) {
        this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
    }
    if (!this._pe) {
        this._pe = new PhysicsEngine();
        this._pe.sleep();
    }
    if (!this._properties) {
        this._properties = {};
    } else {
        for (var propName in this._properties) {
            this._properties[propName].init = false;
        }
    }
    if (!this._lockTransitionable) {
        this._lockTransitionable = new Transitionable(1);
    } else {
        this._lockTransitionable.halt();
        this._lockTransitionable.reset(1);
    }
    this._specModified = true;
    this._initial = true;
    if (spec) {
        this.setSpec(spec);
    }
}
FlowLayoutNode.prototype = Object.create(LayoutNode.prototype);
FlowLayoutNode.prototype.constructor = FlowLayoutNode;
FlowLayoutNode.DEFAULT_OPTIONS = {
    spring: {
        dampingRatio: 0.8,
        period: 300
    },
    particleRounding: 0.001
};
var DEFAULT = {
        opacity: 1,
        opacity2D: [
            1,
            0
        ],
        size: [
            0,
            0
        ],
        origin: [
            0,
            0
        ],
        align: [
            0,
            0
        ],
        scale: [
            1,
            1,
            1
        ],
        translate: [
            0,
            0,
            0
        ],
        rotate: [
            0,
            0,
            0
        ],
        skew: [
            0,
            0,
            0
        ]
    };
FlowLayoutNode.prototype.setOptions = function (options) {
    this._optionsManager.setOptions(options);
    var wasSleeping = this._pe.isSleeping();
    for (var propName in this._properties) {
        var prop = this._properties[propName];
        if (prop.force) {
            prop.force.setOptions(prop.force);
        }
    }
    if (wasSleeping) {
        this._pe.sleep();
    }
    return this;
};
FlowLayoutNode.prototype.setSpec = function (spec) {
    var set;
    if (spec.transform) {
        set = Transform.interpret(spec.transform);
    }
    if (!set) {
        set = {};
    }
    set.opacity = spec.opacity;
    set.size = spec.size;
    set.align = spec.align;
    set.origin = spec.origin;
    var oldRemoving = this._removing;
    var oldInvalidated = this._invalidated;
    this.set(set);
    this._removing = oldRemoving;
    this._invalidated = oldInvalidated;
};
FlowLayoutNode.prototype.reset = function () {
    if (this._invalidated) {
        for (var propName in this._properties) {
            this._properties[propName].invalidated = false;
        }
        this._invalidated = false;
    }
    this.trueSizeRequested = false;
    this.usesTrueSize = false;
};
FlowLayoutNode.prototype.remove = function (removeSpec) {
    this._removing = true;
    if (removeSpec) {
        this.setSpec(removeSpec);
    } else {
        this._pe.sleep();
        this._specModified = false;
    }
    this._invalidated = false;
};
FlowLayoutNode.prototype.releaseLock = function (duration) {
    this._lockTransitionable.halt();
    this._lockTransitionable.reset(0);
    this._lockTransitionable.set(1, { duration: duration || this.options.spring.period || 1000 });
};
function _getRoundedValue3D(prop, def, precision, lockValue) {
    if (!prop || !prop.init) {
        return def;
    }
    return [
        Math.round((prop.curState.x + (prop.endState.x - prop.curState.x) * lockValue) / precision) * precision,
        Math.round((prop.curState.y + (prop.endState.y - prop.curState.y) * lockValue) / precision) * precision,
        Math.round((prop.curState.z + (prop.endState.z - prop.curState.z) * lockValue) / precision) * precision
    ];
}
FlowLayoutNode.prototype.getSpec = function () {
    var endStateReached = this._pe.isSleeping();
    if (!this._specModified && endStateReached) {
        this._spec.removed = !this._invalidated;
        return this._spec;
    }
    this._initial = false;
    this._specModified = !endStateReached;
    this._spec.removed = false;
    if (!endStateReached) {
        this._pe.step();
    }
    var spec = this._spec;
    var precision = this.options.particleRounding;
    var lockValue = this._lockTransitionable.get();
    var prop = this._properties.opacity;
    if (prop && prop.init) {
        spec.opacity = Math.round(Math.max(0, Math.min(1, prop.curState.x)) / precision) * precision;
    } else {
        spec.opacity = undefined;
    }
    prop = this._properties.size;
    if (prop && prop.init) {
        spec.size = spec.size || [
            0,
            0
        ];
        spec.size[0] = Math.round((prop.curState.x + (prop.endState.x - prop.curState.x) * lockValue) / 0.1) * 0.1;
        spec.size[1] = Math.round((prop.curState.y + (prop.endState.y - prop.curState.y) * lockValue) / 0.1) * 0.1;
    } else {
        spec.size = undefined;
    }
    prop = this._properties.align;
    if (prop && prop.init) {
        spec.align = spec.align || [
            0,
            0
        ];
        spec.align[0] = Math.round((prop.curState.x + (prop.endState.x - prop.curState.x) * lockValue) / 0.1) * 0.1;
        spec.align[1] = Math.round((prop.curState.y + (prop.endState.y - prop.curState.y) * lockValue) / 0.1) * 0.1;
    } else {
        spec.align = undefined;
    }
    prop = this._properties.origin;
    if (prop && prop.init) {
        spec.origin = spec.origin || [
            0,
            0
        ];
        spec.origin[0] = Math.round((prop.curState.x + (prop.endState.x - prop.curState.x) * lockValue) / 0.1) * 0.1;
        spec.origin[1] = Math.round((prop.curState.y + (prop.endState.y - prop.curState.y) * lockValue) / 0.1) * 0.1;
    } else {
        spec.origin = undefined;
    }
    var translate = this._properties.translate;
    var translateX;
    var translateY;
    var translateZ;
    if (translate && translate.init) {
        translateX = Math.round((translate.curState.x + (translate.endState.x - translate.curState.x) * lockValue) / precision) * precision;
        translateY = Math.round((translate.curState.y + (translate.endState.y - translate.curState.y) * lockValue) / precision) * precision;
        translateZ = Math.round((translate.curState.z + (translate.endState.z - translate.curState.z) * lockValue) / precision) * precision;
    } else {
        translateX = 0;
        translateY = 0;
        translateZ = 0;
    }
    var scale = this._properties.scale;
    var skew = this._properties.skew;
    var rotate = this._properties.rotate;
    if (scale || skew || rotate) {
        spec.transform = Transform.build({
            translate: [
                translateX,
                translateY,
                translateZ
            ],
            skew: _getRoundedValue3D.call(this, skew, DEFAULT.skew, this.options.particleRounding, lockValue),
            scale: _getRoundedValue3D.call(this, scale, DEFAULT.scale, this.options.particleRounding, lockValue),
            rotate: _getRoundedValue3D.call(this, rotate, DEFAULT.rotate, this.options.particleRounding, lockValue)
        });
    } else if (translate) {
        if (!spec.transform) {
            spec.transform = Transform.translate(translateX, translateY, translateZ);
        } else {
            spec.transform[12] = translateX;
            spec.transform[13] = translateY;
            spec.transform[14] = translateZ;
        }
    } else {
        spec.transform = undefined;
    }
    return this._spec;
};
function _setPropertyValue(prop, propName, endState, defaultValue, immediate, isTranslate) {
    prop = prop || this._properties[propName];
    if (prop && prop.init) {
        prop.invalidated = true;
        var value = defaultValue;
        if (endState !== undefined) {
            value = endState;
        } else if (this._removing) {
            value = prop.particle.getPosition();
        }
        prop.endState.x = value[0];
        prop.endState.y = value.length > 1 ? value[1] : 0;
        prop.endState.z = value.length > 2 ? value[2] : 0;
        if (immediate) {
            prop.curState.x = prop.endState.x;
            prop.curState.y = prop.endState.y;
            prop.curState.z = prop.endState.z;
            prop.velocity.x = 0;
            prop.velocity.y = 0;
            prop.velocity.z = 0;
        } else if (prop.endState.x !== prop.curState.x || prop.endState.y !== prop.curState.y || prop.endState.z !== prop.curState.z) {
            this._pe.wake();
        }
        return;
    } else {
        var wasSleeping = this._pe.isSleeping();
        if (!prop) {
            prop = {
                particle: new Particle({ position: this._initial || immediate ? endState : defaultValue }),
                endState: new Vector(endState)
            };
            prop.curState = prop.particle.position;
            prop.velocity = prop.particle.velocity;
            prop.force = new Spring(this.options.spring);
            prop.force.setOptions({ anchor: prop.endState });
            this._pe.addBody(prop.particle);
            prop.forceId = this._pe.attach(prop.force, prop.particle);
            this._properties[propName] = prop;
        } else {
            prop.particle.setPosition(this._initial || immediate ? endState : defaultValue);
            prop.endState.set(endState);
        }
        if (!this._initial && !immediate) {
            this._pe.wake();
        } else if (wasSleeping) {
            this._pe.sleep();
        }
        prop.init = true;
        prop.invalidated = true;
    }
}
function _getIfNE2D(a1, a2) {
    return a1[0] === a2[0] && a1[1] === a2[1] ? undefined : a1;
}
function _getIfNE3D(a1, a2) {
    return a1[0] === a2[0] && a1[1] === a2[1] && a1[2] === a2[2] ? undefined : a1;
}
FlowLayoutNode.prototype.set = function (set, defaultSize) {
    if (defaultSize) {
        this._removing = false;
    }
    this._invalidated = true;
    this.scrollLength = set.scrollLength;
    this._specModified = true;
    var prop = this._properties.opacity;
    var value = set.opacity === DEFAULT.opacity ? undefined : set.opacity;
    if (value !== undefined || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'opacity', value === undefined ? undefined : [
            value,
            0
        ], DEFAULT.opacity2D);
    }
    prop = this._properties.align;
    value = set.align ? _getIfNE2D(set.align, DEFAULT.align) : undefined;
    if (value || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'align', value, DEFAULT.align);
    }
    prop = this._properties.origin;
    value = set.origin ? _getIfNE2D(set.origin, DEFAULT.origin) : undefined;
    if (value || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'origin', value, DEFAULT.origin);
    }
    prop = this._properties.size;
    value = set.size || defaultSize;
    if (value || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'size', value, defaultSize, this.usesTrueSize);
    }
    prop = this._properties.translate;
    value = set.translate;
    if (value || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'translate', value, DEFAULT.translate, undefined, true);
    }
    prop = this._properties.scale;
    value = set.scale ? _getIfNE3D(set.scale, DEFAULT.scale) : undefined;
    if (value || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'scale', value, DEFAULT.scale);
    }
    prop = this._properties.rotate;
    value = set.rotate ? _getIfNE3D(set.rotate, DEFAULT.rotate) : undefined;
    if (value || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'rotate', value, DEFAULT.rotate);
    }
    prop = this._properties.skew;
    value = set.skew ? _getIfNE3D(set.skew, DEFAULT.skew) : undefined;
    if (value || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'skew', value, DEFAULT.skew);
    }
};
module.exports = FlowLayoutNode;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./LayoutNode":6}],4:[function(require,module,exports){
function LayoutContext(methods) {
    for (var n in methods) {
        this[n] = methods[n];
    }
}
LayoutContext.prototype.size = undefined;
LayoutContext.prototype.direction = undefined;
LayoutContext.prototype.scrollOffset = undefined;
LayoutContext.prototype.scrollStart = undefined;
LayoutContext.prototype.scrollEnd = undefined;
LayoutContext.prototype.next = function () {
};
LayoutContext.prototype.prev = function () {
};
LayoutContext.prototype.get = function (node) {
};
LayoutContext.prototype.set = function (node, set) {
};
LayoutContext.prototype.resolveSize = function (node) {
};
module.exports = LayoutContext;
},{}],5:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var Entity = typeof window !== 'undefined' ? window.famous.core.Entity : typeof global !== 'undefined' ? global.famous.core.Entity : null;
var ViewSequence = typeof window !== 'undefined' ? window.famous.core.ViewSequence : typeof global !== 'undefined' ? global.famous.core.ViewSequence : null;
var OptionsManager = typeof window !== 'undefined' ? window.famous.core.OptionsManager : typeof global !== 'undefined' ? global.famous.core.OptionsManager : null;
var EventHandler = typeof window !== 'undefined' ? window.famous.core.EventHandler : typeof global !== 'undefined' ? global.famous.core.EventHandler : null;
var LayoutUtility = require('./LayoutUtility');
var LayoutNodeManager = require('./LayoutNodeManager');
var LayoutNode = require('./LayoutNode');
var FlowLayoutNode = require('./FlowLayoutNode');
var Transform = typeof window !== 'undefined' ? window.famous.core.Transform : typeof global !== 'undefined' ? global.famous.core.Transform : null;
require('./helpers/LayoutDockHelper');
function LayoutController(options, nodeManager) {
    this.id = Entity.register(this);
    this._isDirty = true;
    this._contextSizeCache = [
        0,
        0
    ];
    this._commitOutput = {};
    this._eventInput = new EventHandler();
    EventHandler.setInputHandler(this, this._eventInput);
    this._eventOutput = new EventHandler();
    EventHandler.setOutputHandler(this, this._eventOutput);
    this._layout = { options: Object.create({}) };
    this._layout.optionsManager = new OptionsManager(this._layout.options);
    this._layout.optionsManager.on('change', function () {
        this._isDirty = true;
    }.bind(this));
    this.options = Object.create(LayoutController.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);
    if (nodeManager) {
        this._nodes = nodeManager;
    } else if (options && options.flow) {
        this._nodes = new LayoutNodeManager(FlowLayoutNode, _initFlowLayoutNode.bind(this));
    } else {
        this._nodes = new LayoutNodeManager(LayoutNode);
    }
    this.setDirection(undefined);
    if (options) {
        this.setOptions(options);
    }
}
LayoutController.DEFAULT_OPTIONS = {
    nodeSpring: {
        dampingRatio: 0.8,
        period: 300
    },
    reflowOnResize: true
};
function _initFlowLayoutNode(node, spec) {
    if (!spec && this.options.insertSpec) {
        node.setSpec(this.options.insertSpec);
    }
}
LayoutController.prototype.setOptions = function setOptions(options) {
    if (options.alignment !== undefined && options.alignment !== this.options.alignment) {
        this._isDirty = true;
    }
    this._optionsManager.setOptions(options);
    if (options.dataSource) {
        this.setDataSource(options.dataSource);
    }
    if (options.layout) {
        this.setLayout(options.layout, options.layoutOptions);
    } else if (options.layoutOptions) {
        this.setLayoutOptions(options.layoutOptions);
    }
    if (options.direction !== undefined) {
        this.setDirection(options.direction);
    }
    if (options.nodeSpring && this.options.flow) {
        this._nodes.setNodeOptions({ spring: options.nodeSpring });
    }
    if (options.preallocateNodes) {
        this._nodes.preallocateNodes(options.preallocateNodes.count || 0, options.preallocateNodes.spec);
    }
    return this;
};
function _forEachRenderable(callback) {
    var dataSource = this._dataSource;
    if (dataSource instanceof Array) {
        for (var i = 0, j = dataSource.length; i < j; i++) {
            callback(dataSource[i]);
        }
    } else if (dataSource instanceof ViewSequence) {
        var renderable;
        while (dataSource) {
            renderable = dataSource.get();
            if (!renderable) {
                break;
            }
            callback(renderable);
            dataSource = dataSource.getNext();
        }
    } else {
        for (var key in dataSource) {
            callback(dataSource[key]);
        }
    }
}
LayoutController.prototype.setDataSource = function (dataSource) {
    this._dataSource = dataSource;
    this._nodesById = undefined;
    if (dataSource instanceof Array) {
        this._viewSequence = new ViewSequence(dataSource);
    } else if (dataSource instanceof ViewSequence || dataSource.getNext) {
        this._viewSequence = dataSource;
    } else if (dataSource instanceof Object) {
        this._nodesById = dataSource;
    }
    if (this.options.autoPipeEvents) {
        if (this._dataSource.pipe) {
            this._dataSource.pipe(this);
            this._dataSource.pipe(this._eventOutput);
        } else {
            _forEachRenderable.call(this, function (renderable) {
                if (renderable && renderable.pipe) {
                    renderable.pipe(this);
                    renderable.pipe(this._eventOutput);
                }
            }.bind(this));
        }
    }
    this._isDirty = true;
    return this;
};
LayoutController.prototype.getDataSource = function () {
    return this._dataSource;
};
LayoutController.prototype.setLayout = function (layout, options) {
    if (layout instanceof Function) {
        this._layout._function = layout;
        this._layout.capabilities = layout.Capabilities;
        this._layout.literal = undefined;
    } else if (layout instanceof Object) {
        this._layout.literal = layout;
        this._layout.capabilities = undefined;
        var helperName = Object.keys(layout)[0];
        var Helper = LayoutUtility.getRegisteredHelper(helperName);
        this._layout._function = Helper ? function (context, options2) {
            var helper = new Helper(context, options2);
            helper.parse(layout[helperName]);
        } : undefined;
    } else {
        this._layout._function = undefined;
        this._layout.capabilities = undefined;
        this._layout.literal = undefined;
    }
    if (options) {
        this.setLayoutOptions(options);
    }
    this.setDirection(this._configuredDirection);
    this._isDirty = true;
    return this;
};
LayoutController.prototype.getLayout = function () {
    return this._layout.literal || this._layout._function;
};
LayoutController.prototype.setLayoutOptions = function (options) {
    this._layout.optionsManager.setOptions(options);
    return this;
};
LayoutController.prototype.getLayoutOptions = function () {
    return this._layout.options;
};
function _getActualDirection(direction) {
    if (this._layout.capabilities && this._layout.capabilities.direction) {
        if (Array.isArray(this._layout.capabilities.direction)) {
            for (var i = 0; i < this._layout.capabilities.direction.length; i++) {
                if (this._layout.capabilities.direction[i] === direction) {
                    return direction;
                }
            }
            return this._layout.capabilities.direction[0];
        } else {
            return this._layout.capabilities.direction;
        }
    }
    return direction === undefined ? Utility.Direction.Y : direction;
}
LayoutController.prototype.setDirection = function (direction) {
    this._configuredDirection = direction;
    var newDirection = _getActualDirection.call(this, direction);
    if (newDirection !== this._direction) {
        this._direction = newDirection;
        this._isDirty = true;
    }
};
LayoutController.prototype.getDirection = function (actual) {
    return actual ? this._direction : this._configuredDirection;
};
LayoutController.prototype.getSpec = function (node, normalize) {
    if (!node) {
        return undefined;
    }
    if (node instanceof String || typeof node === 'string') {
        if (!this._nodesById) {
            return undefined;
        }
        node = this._nodesById[node];
        if (!node) {
            return undefined;
        }
        if (node instanceof Array) {
            return node;
        }
    }
    if (this._specs) {
        for (var i = 0; i < this._specs.length; i++) {
            var spec = this._specs[i];
            if (spec.renderNode === node) {
                if (normalize && spec.transform && spec.size && (spec.align || spec.origin)) {
                    var transform = spec.transform;
                    if (spec.align && (spec.align[0] || spec.align[1])) {
                        transform = Transform.thenMove(transform, [
                            spec.align[0] * this._contextSizeCache[0],
                            spec.align[1] * this._contextSizeCache[1],
                            0
                        ]);
                    }
                    if (spec.origin && (spec.origin[0] || spec.origin[1])) {
                        transform = Transform.moveThen([
                            -spec.origin[0] * spec.size[0],
                            -spec.origin[1] * spec.size[1],
                            0
                        ], transform);
                    }
                    return {
                        opacity: spec.opacity,
                        size: spec.size,
                        transform: transform
                    };
                }
                return spec;
            }
        }
    }
    return undefined;
};
LayoutController.prototype.reflowLayout = function () {
    this._isDirty = true;
    return this;
};
LayoutController.prototype.insert = function (indexOrId, renderable, insertSpec) {
    if (indexOrId instanceof String || typeof indexOrId === 'string') {
        if (this._dataSource === undefined) {
            this._dataSource = {};
            this._nodesById = this._dataSource;
        }
        this._nodesById[indexOrId] = renderable;
    } else {
        if (this._dataSource === undefined) {
            this._dataSource = [];
            this._viewSequence = new ViewSequence(this._dataSource);
        }
        var dataSource = this._viewSequence || this._dataSource;
        if (indexOrId === -1) {
            dataSource.push(renderable);
        } else if (indexOrId === 0) {
            if (dataSource === this._viewSequence) {
                dataSource.splice(0, 0, renderable);
                if (this._viewSequence.getIndex() === 0) {
                    var nextViewSequence = this._viewSequence.getNext();
                    if (nextViewSequence && nextViewSequence.get()) {
                        this._viewSequence = nextViewSequence;
                    }
                }
            } else {
                dataSource.splice(0, 0, renderable);
            }
        } else {
            dataSource.splice(indexOrId, 0, renderable);
        }
    }
    if (insertSpec) {
        this._nodes.insertNode(this._nodes.createNode(renderable, insertSpec));
    }
    if (this.options.autoPipeEvents && renderable && renderable.pipe) {
        renderable.pipe(this);
        renderable.pipe(this._eventOutput);
    }
    this._isDirty = true;
    return this;
};
LayoutController.prototype.push = function (renderable, insertSpec) {
    return this.insert(-1, renderable, insertSpec);
};
function _getViewSequenceAtIndex(index) {
    var viewSequence = this._viewSequence;
    var i = viewSequence ? viewSequence.getIndex() : index;
    if (index > i) {
        while (viewSequence) {
            viewSequence = viewSequence.getNext();
            if (!viewSequence) {
                return undefined;
            }
            i = viewSequence.getIndex();
            if (i === index) {
                return viewSequence;
            } else if (index < i) {
                return undefined;
            }
        }
    } else if (index < i) {
        while (viewSequence) {
            viewSequence = viewSequence.getPrevious();
            if (!viewSequence) {
                return undefined;
            }
            i = viewSequence.getIndex();
            if (i === index) {
                return viewSequence;
            } else if (index > i) {
                return undefined;
            }
        }
    }
    return viewSequence;
}
LayoutController.prototype.swap = function (index, index2) {
    if (this._viewSequence) {
        _getViewSequenceAtIndex.call(this, index).swap(_getViewSequenceAtIndex.call(this, index2));
        this._isDirty = true;
    }
    return this;
};
LayoutController.prototype.remove = function (indexOrId, removeSpec) {
    var renderNode;
    if (this._nodesById || indexOrId instanceof String || typeof indexOrId === 'string') {
        renderNode = this._nodesById[indexOrId];
        if (renderNode) {
            delete this._nodesById[indexOrId];
        }
    } else {
        renderNode = this._dataSource.splice(indexOrId, 1)[0];
    }
    if (renderNode && removeSpec) {
        var node = this._nodes.getNodeByRenderNode(renderNode);
        if (node) {
            node.remove(removeSpec || this.options.removeSpec);
        }
    }
    if (renderNode) {
        this._isDirty = true;
    }
    return this;
};
LayoutController.prototype.removeAll = function () {
    if (this._nodesById) {
        var dirty = false;
        for (var key in this._nodesById) {
            delete this._nodesById[key];
            dirty = true;
        }
        if (dirty) {
            this._isDirty = true;
        }
    } else if (this._dataSource) {
        this.setDataSource([]);
    }
    return this;
};
LayoutController.prototype.getSize = function () {
    return this._size || this.options.size;
};
LayoutController.prototype.render = function render() {
    return this.id;
};
LayoutController.prototype.commit = function commit(context) {
    var transform = context.transform;
    var origin = context.origin;
    var size = context.size;
    var opacity = context.opacity;
    if (size[0] !== this._contextSizeCache[0] || size[1] !== this._contextSizeCache[1] || this._isDirty || this._nodes._trueSizeRequested || this.options.alwaysLayout) {
        var eventData = {
                target: this,
                oldSize: this._contextSizeCache,
                size: size,
                dirty: this._isDirty,
                trueSizeRequested: this._nodes._trueSizeRequested
            };
        this._eventOutput.emit('layoutstart', eventData);
        if (this.options.flow && (this._isDirty || this.options.reflowOnResize && (size[0] !== this._contextSizeCache[0] || size[1] !== this._contextSizeCache[1]))) {
            var node = this._nodes.getStartEnumNode();
            while (node) {
                node.releaseLock();
                node = node._next;
            }
        }
        this._contextSizeCache[0] = size[0];
        this._contextSizeCache[1] = size[1];
        this._isDirty = false;
        var scrollEnd;
        if (this.options.size && this.options.size[this._direction] === true) {
            scrollEnd = 1000000;
        }
        var layoutContext = this._nodes.prepareForLayout(this._viewSequence, this._nodesById, {
                size: size,
                direction: this._direction,
                scrollEnd: scrollEnd
            });
        if (this._layout._function) {
            this._layout._function(layoutContext, this._layout.options);
        }
        this._nodes.removeVirtualViewSequenceNodes();
        if (scrollEnd) {
            scrollEnd = 0;
            node = this._nodes.getStartEnumNode();
            while (node) {
                if (node._invalidated && node.scrollLength) {
                    scrollEnd += node.scrollLength;
                }
                node = node._next;
            }
            this._size = this._size || [
                0,
                0
            ];
            this._size[0] = this.options.size[0];
            this._size[1] = this.options.size[1];
            this._size[this._direction] = scrollEnd;
        }
        var result = this._nodes.buildSpecAndDestroyUnrenderedNodes();
        this._commitOutput.target = result.specs;
        this._eventOutput.emit('reflow', { target: this });
        this._eventOutput.emit('layoutend', eventData);
    } else if (this.options.flow) {
        result = this._nodes.buildSpecAndDestroyUnrenderedNodes();
        this._commitOutput.target = result.specs;
        if (result.modified) {
            this._eventOutput.emit('reflow', { target: this });
        }
    }
    this._specs = this._commitOutput.target;
    var target = this._commitOutput.target;
    for (var i = 0, j = target.length; i < j; i++) {
        target[i].target = target[i].renderNode.render();
    }
    if (origin && (origin[0] !== 0 || origin[1] !== 0)) {
        transform = Transform.moveThen([
            -size[0] * origin[0],
            -size[1] * origin[1],
            0
        ], transform);
    }
    this._commitOutput.size = size;
    this._commitOutput.opacity = opacity;
    this._commitOutput.transform = transform;
    return this._commitOutput;
};
module.exports = LayoutController;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./FlowLayoutNode":3,"./LayoutNode":6,"./LayoutNodeManager":7,"./LayoutUtility":8,"./helpers/LayoutDockHelper":11}],6:[function(require,module,exports){
(function (global){
var Transform = typeof window !== 'undefined' ? window.famous.core.Transform : typeof global !== 'undefined' ? global.famous.core.Transform : null;
var LayoutUtility = require('./LayoutUtility');
function LayoutNode(renderNode, spec) {
    this.renderNode = renderNode;
    this._spec = spec ? LayoutUtility.cloneSpec(spec) : {};
    this._spec.renderNode = renderNode;
    this._specModified = true;
    this._invalidated = false;
    this._removing = false;
}
LayoutNode.prototype.setOptions = function (options) {
};
LayoutNode.prototype.destroy = function () {
    this.renderNode = undefined;
    this._spec.renderNode = undefined;
    this._viewSequence = undefined;
};
LayoutNode.prototype.reset = function () {
    this._invalidated = false;
    this.trueSizeRequested = false;
};
LayoutNode.prototype.setSpec = function (spec) {
    this._specModified = true;
    if (spec.align) {
        if (!spec.align) {
            this._spec.align = [
                0,
                0
            ];
        }
        this._spec.align[0] = spec.align[0];
        this._spec.align[1] = spec.align[1];
    } else {
        this._spec.align = undefined;
    }
    if (spec.origin) {
        if (!spec.origin) {
            this._spec.origin = [
                0,
                0
            ];
        }
        this._spec.origin[0] = spec.origin[0];
        this._spec.origin[1] = spec.origin[1];
    } else {
        this._spec.origin = undefined;
    }
    if (spec.size) {
        if (!spec.size) {
            this._spec.size = [
                0,
                0
            ];
        }
        this._spec.size[0] = spec.size[0];
        this._spec.size[1] = spec.size[1];
    } else {
        this._spec.size = undefined;
    }
    if (spec.transform) {
        if (!spec.transform) {
            this._spec.transform = spec.transform.slice(0);
        } else {
            for (var i = 0; i < 16; i++) {
                this._spec.transform[0] = spec.transform[0];
            }
        }
    } else {
        this._spec.transform = undefined;
    }
    this._spec.opacity = spec.opacity;
};
LayoutNode.prototype.set = function (set, size) {
    this._invalidated = true;
    this._specModified = true;
    this._removing = false;
    var spec = this._spec;
    spec.opacity = set.opacity;
    if (set.size) {
        if (!spec.size) {
            spec.size = [
                0,
                0
            ];
        }
        spec.size[0] = set.size[0];
        spec.size[1] = set.size[1];
    } else {
        spec.size = undefined;
    }
    if (set.origin) {
        if (!spec.origin) {
            spec.origin = [
                0,
                0
            ];
        }
        spec.origin[0] = set.origin[0];
        spec.origin[1] = set.origin[1];
    } else {
        spec.origin = undefined;
    }
    if (set.align) {
        if (!spec.align) {
            spec.align = [
                0,
                0
            ];
        }
        spec.align[0] = set.align[0];
        spec.align[1] = set.align[1];
    } else {
        spec.align = undefined;
    }
    if (set.skew || set.rotate || set.scale) {
        this._spec.transform = Transform.build({
            translate: set.translate || [
                0,
                0,
                0
            ],
            skew: set.skew || [
                0,
                0,
                0
            ],
            scale: set.scale || [
                1,
                1,
                1
            ],
            rotate: set.rotate || [
                0,
                0,
                0
            ]
        });
    } else if (set.translate) {
        this._spec.transform = Transform.translate(set.translate[0], set.translate[1], set.translate[2]);
    } else {
        this._spec.transform = undefined;
    }
    this.scrollLength = set.scrollLength;
};
LayoutNode.prototype.getSpec = function () {
    this._specModified = false;
    this._spec.removed = !this._invalidated;
    return this._spec;
};
LayoutNode.prototype.remove = function (removeSpec) {
    this._removing = true;
};
module.exports = LayoutNode;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./LayoutUtility":8}],7:[function(require,module,exports){
var LayoutContext = require('./LayoutContext');
var LayoutUtility = require('./LayoutUtility');
var MAX_POOL_SIZE = 100;
function LayoutNodeManager(LayoutNode, initLayoutNodeFn) {
    this.LayoutNode = LayoutNode;
    this._initLayoutNodeFn = initLayoutNodeFn;
    this._layoutCount = 0;
    this._context = new LayoutContext({
        next: _contextNext.bind(this),
        prev: _contextPrev.bind(this),
        get: _contextGet.bind(this),
        set: _contextSet.bind(this),
        resolveSize: _contextResolveSize.bind(this),
        size: [
            0,
            0
        ]
    });
    this._contextState = {};
    this._pool = {
        layoutNodes: { size: 0 },
        resolveSize: [
            0,
            0
        ]
    };
}
LayoutNodeManager.prototype.prepareForLayout = function (viewSequence, nodesById, contextData) {
    var node = this._first;
    while (node) {
        node.reset();
        node = node._next;
    }
    var context = this._context;
    this._layoutCount++;
    this._nodesById = nodesById;
    this._trueSizeRequested = false;
    this._reevalTrueSize = contextData.reevalTrueSize || !context.size || context.size[0] !== contextData.size[0] || context.size[1] !== contextData.size[1];
    var contextState = this._contextState;
    contextState.startSequence = viewSequence;
    contextState.nextSequence = viewSequence;
    contextState.prevSequence = viewSequence;
    contextState.start = undefined;
    contextState.nextGetIndex = 0;
    contextState.prevGetIndex = 0;
    contextState.nextSetIndex = 0;
    contextState.prevSetIndex = 0;
    contextState.addCount = 0;
    contextState.removeCount = 0;
    context.size[0] = contextData.size[0];
    context.size[1] = contextData.size[1];
    context.direction = contextData.direction;
    context.reverse = contextData.reverse;
    context.alignment = contextData.reverse ? 1 : 0;
    context.scrollOffset = contextData.scrollOffset || 0;
    context.scrollStart = contextData.scrollStart || 0;
    context.scrollEnd = contextData.scrollEnd || context.size[context.direction];
    return context;
};
LayoutNodeManager.prototype.removeNonInvalidatedNodes = function (removeSpec) {
    var node = this._first;
    while (node) {
        if (!node._invalidated && !node._removing) {
            node.remove(removeSpec);
        }
        node = node._next;
    }
};
LayoutNodeManager.prototype.removeVirtualViewSequenceNodes = function () {
    if (this._contextState.startSequence && this._contextState.startSequence.cleanup) {
        this._contextState.startSequence.cleanup();
    }
};
LayoutNodeManager.prototype.buildSpecAndDestroyUnrenderedNodes = function (translate) {
    var specs = [];
    var result = {
            specs: specs,
            modified: false
        };
    var node = this._first;
    while (node) {
        var modified = node._specModified;
        var spec = node.getSpec();
        if (spec.removed) {
            var destroyNode = node;
            node = node._next;
            _destroyNode.call(this, destroyNode);
            result.modified = true;
        } else {
            if (modified) {
                if (spec.transform && translate) {
                    spec.transform[12] += translate[0];
                    spec.transform[13] += translate[1];
                    spec.transform[14] += translate[2];
                    spec.transform[12] = Math.round(spec.transform[12] * 100000) / 100000;
                    spec.transform[13] = Math.round(spec.transform[13] * 100000) / 100000;
                }
                result.modified = true;
            }
            specs.push(spec);
            node = node._next;
        }
    }
    this._contextState.addCount = 0;
    this._contextState.removeCount = 0;
    return result;
};
LayoutNodeManager.prototype.getNodeByRenderNode = function (renderable) {
    var node = this._first;
    while (node) {
        if (node.renderNode === renderable) {
            return node;
        }
        node = node._next;
    }
    return undefined;
};
LayoutNodeManager.prototype.insertNode = function (node) {
    node._next = this._first;
    if (this._first) {
        this._first._prev = node;
    }
    this._first = node;
};
LayoutNodeManager.prototype.setNodeOptions = function (options) {
    this._nodeOptions = options;
    var node = this._first;
    while (node) {
        node.setOptions(options);
        node = node._next;
    }
    node = this._pool.layoutNodes.first;
    while (node) {
        node.setOptions(options);
        node = node._next;
    }
};
LayoutNodeManager.prototype.preallocateNodes = function (count, spec) {
    var nodes = [];
    for (var i = 0; i < count; i++) {
        nodes.push(this.createNode(undefined, spec));
    }
    for (i = 0; i < count; i++) {
        _destroyNode.call(this, nodes[i]);
    }
};
LayoutNodeManager.prototype.createNode = function (renderNode, spec) {
    var node;
    if (this._pool.layoutNodes.first) {
        node = this._pool.layoutNodes.first;
        this._pool.layoutNodes.first = node._next;
        this._pool.layoutNodes.size--;
        node.constructor.apply(node, arguments);
    } else {
        node = new this.LayoutNode(renderNode, spec);
        if (this._nodeOptions) {
            node.setOptions(this._nodeOptions);
        }
    }
    node._prev = undefined;
    node._next = undefined;
    node._viewSequence = undefined;
    node._layoutCount = 0;
    if (this._initLayoutNodeFn) {
        this._initLayoutNodeFn.call(this, node, spec);
    }
    return node;
};
function _destroyNode(node) {
    if (node._next) {
        node._next._prev = node._prev;
    }
    if (node._prev) {
        node._prev._next = node._next;
    } else {
        this._first = node._next;
    }
    node.destroy();
    if (this._pool.layoutNodes.size < MAX_POOL_SIZE) {
        this._pool.layoutNodes.size++;
        node._prev = undefined;
        node._next = this._pool.layoutNodes.first;
        this._pool.layoutNodes.first = node;
    }
}
LayoutNodeManager.prototype.getStartEnumNode = function (next) {
    if (next === undefined) {
        return this._first;
    } else if (next === true) {
        return this._contextState.start && this._contextState.startPrev ? this._contextState.start._next : this._contextState.start;
    } else if (next === false) {
        return this._contextState.start && !this._contextState.startPrev ? this._contextState.start._prev : this._contextState.start;
    }
};
function _contextGetCreateAndOrderNodes(renderNode, prev) {
    var node;
    var state = this._contextState;
    if (!state.start) {
        node = this._first;
        while (node) {
            if (node.renderNode === renderNode) {
                break;
            }
            node = node._next;
        }
        if (!node) {
            node = this.createNode(renderNode);
            node._next = this._first;
            if (this._first) {
                this._first._prev = node;
            }
            this._first = node;
        }
        state.start = node;
        state.startPrev = prev;
        state.prev = node;
        state.next = node;
        return node;
    }
    if (prev) {
        if (state.prev._prev && state.prev._prev.renderNode === renderNode) {
            state.prev = state.prev._prev;
            return state.prev;
        }
    } else {
        if (state.next._next && state.next._next.renderNode === renderNode) {
            state.next = state.next._next;
            return state.next;
        }
    }
    node = this._first;
    while (node) {
        if (node.renderNode === renderNode) {
            break;
        }
        node = node._next;
    }
    if (!node) {
        node = this.createNode(renderNode);
    } else {
        if (node._next) {
            node._next._prev = node._prev;
        }
        if (node._prev) {
            node._prev._next = node._next;
        } else {
            this._first = node._next;
        }
        node._next = undefined;
        node._prev = undefined;
    }
    if (prev) {
        if (state.prev._prev) {
            node._prev = state.prev._prev;
            state.prev._prev._next = node;
        } else {
            this._first = node;
        }
        state.prev._prev = node;
        node._next = state.prev;
        state.prev = node;
    } else {
        if (state.next._next) {
            node._next = state.next._next;
            state.next._next._prev = node;
        }
        state.next._next = node;
        node._prev = state.next;
        state.next = node;
    }
    return node;
}
function _contextNext() {
    if (!this._contextState.nextSequence) {
        return undefined;
    }
    if (this._context.reverse) {
        this._contextState.nextSequence = this._contextState.nextSequence.getNext();
        if (!this._contextState.nextSequence) {
            return undefined;
        }
    }
    var renderNode = this._contextState.nextSequence.get();
    if (!renderNode) {
        this._contextState.nextSequence = undefined;
        return undefined;
    }
    var nextSequence = this._contextState.nextSequence;
    if (!this._context.reverse) {
        this._contextState.nextSequence = this._contextState.nextSequence.getNext();
    }
    return {
        renderNode: renderNode,
        viewSequence: nextSequence,
        next: true,
        index: ++this._contextState.nextGetIndex
    };
}
function _contextPrev() {
    if (!this._contextState.prevSequence) {
        return undefined;
    }
    if (!this._context.reverse) {
        this._contextState.prevSequence = this._contextState.prevSequence.getPrevious();
        if (!this._contextState.prevSequence) {
            return undefined;
        }
    }
    var renderNode = this._contextState.prevSequence.get();
    if (!renderNode) {
        this._contextState.prevSequence = undefined;
        return undefined;
    }
    var prevSequence = this._contextState.prevSequence;
    if (this._context.reverse) {
        this._contextState.prevSequence = this._contextState.prevSequence.getPrevious();
    }
    return {
        renderNode: renderNode,
        viewSequence: prevSequence,
        prev: true,
        index: --this._contextState.prevGetIndex
    };
}
function _contextGet(contextNodeOrId) {
    if (this._nodesById && (contextNodeOrId instanceof String || typeof contextNodeOrId === 'string')) {
        var renderNode = this._nodesById[contextNodeOrId];
        if (!renderNode) {
            return undefined;
        }
        if (renderNode instanceof Array) {
            var result = [];
            for (var i = 0, j = renderNode.length; i < j; i++) {
                result.push({
                    renderNode: renderNode[i],
                    arrayElement: true
                });
            }
            return result;
        }
        return {
            renderNode: renderNode,
            byId: true
        };
    } else {
        return contextNodeOrId;
    }
}
function _contextSet(contextNodeOrId, set) {
    var contextNode = this._nodesById ? _contextGet.call(this, contextNodeOrId) : contextNodeOrId;
    if (contextNode) {
        var node = contextNode.node;
        if (!node) {
            if (contextNode.next) {
                if (contextNode.index < this._contextState.nextSetIndex) {
                    LayoutUtility.error('Nodes must be layed out in the same order as they were requested!');
                }
                this._contextState.nextSetIndex = contextNode.index;
            } else if (contextNode.prev) {
                if (contextNode.index > this._contextState.prevSetIndex) {
                    LayoutUtility.error('Nodes must be layed out in the same order as they were requested!');
                }
                this._contextState.prevSetIndex = contextNode.index;
            }
            node = _contextGetCreateAndOrderNodes.call(this, contextNode.renderNode, contextNode.prev);
            node._viewSequence = contextNode.viewSequence;
            node._layoutCount++;
            if (node._layoutCount === 1) {
                this._contextState.addCount++;
            }
            contextNode.node = node;
        }
        node.usesTrueSize = contextNode.usesTrueSize;
        node.trueSizeRequested = contextNode.trueSizeRequested;
        node.set(set, this._context.size);
        contextNode.set = set;
    }
}
function _contextResolveSize(contextNodeOrId, parentSize) {
    var contextNode = this._nodesById ? _contextGet.call(this, contextNodeOrId) : contextNodeOrId;
    var resolveSize = this._pool.resolveSize;
    if (!contextNode) {
        resolveSize[0] = 0;
        resolveSize[1] = 0;
        return resolveSize;
    }
    var renderNode = contextNode.renderNode;
    var size = renderNode.getSize();
    if (!size) {
        return parentSize;
    }
    var configSize = renderNode.size && renderNode._trueSizeCheck !== undefined ? renderNode.size : undefined;
    if (configSize && (configSize[0] === true || configSize[1] === true)) {
        contextNode.usesTrueSize = true;
        var backupSize = renderNode._backupSize;
        if (renderNode._trueSizeCheck) {
            if (backupSize && configSize !== size) {
                var newWidth = configSize[0] === true ? Math.max(backupSize[0], size[0]) : size[0];
                var newHeight = configSize[1] === true ? Math.max(backupSize[1], size[1]) : size[1];
                if (newWidth !== backupSize[0] || newHeight !== backupSize[1]) {
                    this._trueSizeRequested = true;
                    contextNode.trueSizeRequested = true;
                }
                backupSize[0] = newWidth;
                backupSize[1] = newHeight;
                size = backupSize;
                renderNode._backupSize = undefined;
                backupSize = undefined;
            } else {
                this._trueSizeRequested = true;
                contextNode.trueSizeRequested = true;
            }
        }
        if (this._reevalTrueSize || backupSize && (backupSize[0] !== size[0] || backupSize[1] !== size[1])) {
            renderNode._trueSizeCheck = true;
            renderNode._sizeDirty = true;
            this._trueSizeRequested = true;
        }
        if (!backupSize) {
            renderNode._backupSize = [
                0,
                0
            ];
            backupSize = renderNode._backupSize;
        }
        backupSize[0] = size[0];
        backupSize[1] = size[1];
    }
    configSize = renderNode._nodes ? renderNode.options.size : undefined;
    if (configSize && (configSize[0] === true || configSize[1] === true)) {
        if (this._reevalTrueSize || renderNode._nodes._trueSizeRequested) {
            contextNode.usesTrueSize = true;
            contextNode.trueSizeRequested = true;
            this._trueSizeRequested = true;
        }
    }
    if (size[0] === undefined || size[0] === true || size[1] === undefined || size[1] === true) {
        resolveSize[0] = size[0];
        resolveSize[1] = size[1];
        size = resolveSize;
        if (size[0] === undefined) {
            size[0] = parentSize[0];
        } else if (size[0] === true) {
            size[0] = 0;
            this._trueSizeRequested = true;
            contextNode.trueSizeRequested = true;
        }
        if (size[1] === undefined) {
            size[1] = parentSize[1];
        } else if (size[1] === true) {
            size[1] = 0;
            this._trueSizeRequested = true;
            contextNode.trueSizeRequested = true;
        }
    }
    return size;
}
module.exports = LayoutNodeManager;
},{"./LayoutContext":4,"./LayoutUtility":8}],8:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
function LayoutUtility() {
}
LayoutUtility.registeredHelpers = {};
var Capabilities = {
        SEQUENCE: 1,
        DIRECTION_X: 2,
        DIRECTION_Y: 4,
        SCROLLING: 8
    };
LayoutUtility.Capabilities = Capabilities;
LayoutUtility.normalizeMargins = function (margins) {
    if (!margins) {
        return [
            0,
            0,
            0,
            0
        ];
    } else if (!Array.isArray(margins)) {
        return [
            margins,
            margins,
            margins,
            margins
        ];
    } else if (margins.length === 0) {
        return [
            0,
            0,
            0,
            0
        ];
    } else if (margins.length === 1) {
        return [
            margins[0],
            margins[0],
            margins[0],
            margins[0]
        ];
    } else if (margins.length === 2) {
        return [
            margins[0],
            margins[1],
            margins[0],
            margins[1]
        ];
    } else {
        return margins;
    }
};
LayoutUtility.cloneSpec = function (spec) {
    var clone = {};
    if (spec.opacity !== undefined) {
        clone.opacity = spec.opacity;
    }
    if (spec.size !== undefined) {
        clone.size = spec.size.slice(0);
    }
    if (spec.transform !== undefined) {
        clone.transform = spec.transform.slice(0);
    }
    if (spec.origin !== undefined) {
        clone.origin = spec.origin.slice(0);
    }
    if (spec.align !== undefined) {
        clone.align = spec.align.slice(0);
    }
    return clone;
};
function _isEqualArray(a, b) {
    if (a === b) {
        return true;
    }
    if (a === undefined || b === undefined) {
        return false;
    }
    var i = a.length;
    if (i !== b.length) {
        return false;
    }
    while (i--) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
LayoutUtility.isEqualSpec = function (spec1, spec2) {
    if (spec1.opacity !== spec2.opacity) {
        return false;
    }
    if (!_isEqualArray(spec1.size, spec2.size)) {
        return false;
    }
    if (!_isEqualArray(spec1.transform, spec2.transform)) {
        return false;
    }
    if (!_isEqualArray(spec1.origin, spec2.origin)) {
        return false;
    }
    if (!_isEqualArray(spec1.align, spec2.align)) {
        return false;
    }
    return true;
};
LayoutUtility.getSpecDiffText = function (spec1, spec2) {
    var result = 'spec diff:';
    if (spec1.opacity !== spec2.opacity) {
        result += '\nopacity: ' + spec1.opacity + ' != ' + spec2.opacity;
    }
    if (!_isEqualArray(spec1.size, spec2.size)) {
        result += '\nsize: ' + JSON.stringify(spec1.size) + ' != ' + JSON.stringify(spec2.size);
    }
    if (!_isEqualArray(spec1.transform, spec2.transform)) {
        result += '\ntransform: ' + JSON.stringify(spec1.transform) + ' != ' + JSON.stringify(spec2.transform);
    }
    if (!_isEqualArray(spec1.origin, spec2.origin)) {
        result += '\norigin: ' + JSON.stringify(spec1.origin) + ' != ' + JSON.stringify(spec2.origin);
    }
    if (!_isEqualArray(spec1.align, spec2.align)) {
        result += '\nalign: ' + JSON.stringify(spec1.align) + ' != ' + JSON.stringify(spec2.align);
    }
    return result;
};
LayoutUtility.error = function (message) {
    console.log('ERROR: ' + message);
    throw message;
};
LayoutUtility.warning = function (message) {
    console.log('WARNING: ' + message);
};
LayoutUtility.log = function (args) {
    var message = '';
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (arg instanceof Object || arg instanceof Array) {
            message += JSON.stringify(arg);
        } else {
            message += arg;
        }
    }
    console.log(message);
};
LayoutUtility.combineOptions = function (options1, options2, forceClone) {
    if (options1 && !options2 && !forceClone) {
        return options1;
    } else if (!options1 && options2 && !forceClone) {
        return options2;
    }
    var options = Utility.clone(options1 || {});
    if (options2) {
        for (var key in options2) {
            options[key] = options2[key];
        }
    }
    return options;
};
LayoutUtility.registerHelper = function (name, Helper) {
    if (!Helper.prototype.parse) {
        LayoutUtility.error('The layout-helper for name "' + name + '" is required to support the "parse" method');
    }
    if (this.registeredHelpers[name] !== undefined) {
        LayoutUtility.warning('A layout-helper with the name "' + name + '" is already registered and will be overwritten');
    }
    this.registeredHelpers[name] = Helper;
};
LayoutUtility.unregisterHelper = function (name) {
    delete this.registeredHelpers[name];
};
LayoutUtility.getRegisteredHelper = function (name) {
    return this.registeredHelpers[name];
};
module.exports = LayoutUtility;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],9:[function(require,module,exports){
(function (global){
var LayoutUtility = require('./LayoutUtility');
var LayoutController = require('./LayoutController');
var LayoutNode = require('./LayoutNode');
var FlowLayoutNode = require('./FlowLayoutNode');
var LayoutNodeManager = require('./LayoutNodeManager');
var ContainerSurface = typeof window !== 'undefined' ? window.famous.surfaces.ContainerSurface : typeof global !== 'undefined' ? global.famous.surfaces.ContainerSurface : null;
var Transform = typeof window !== 'undefined' ? window.famous.core.Transform : typeof global !== 'undefined' ? global.famous.core.Transform : null;
var EventHandler = typeof window !== 'undefined' ? window.famous.core.EventHandler : typeof global !== 'undefined' ? global.famous.core.EventHandler : null;
var Group = typeof window !== 'undefined' ? window.famous.core.Group : typeof global !== 'undefined' ? global.famous.core.Group : null;
var Vector = typeof window !== 'undefined' ? window.famous.math.Vector : typeof global !== 'undefined' ? global.famous.math.Vector : null;
var PhysicsEngine = typeof window !== 'undefined' ? window.famous.physics.PhysicsEngine : typeof global !== 'undefined' ? global.famous.physics.PhysicsEngine : null;
var Particle = typeof window !== 'undefined' ? window.famous.physics.bodies.Particle : typeof global !== 'undefined' ? global.famous.physics.bodies.Particle : null;
var Drag = typeof window !== 'undefined' ? window.famous.physics.forces.Drag : typeof global !== 'undefined' ? global.famous.physics.forces.Drag : null;
var Spring = typeof window !== 'undefined' ? window.famous.physics.forces.Spring : typeof global !== 'undefined' ? global.famous.physics.forces.Spring : null;
var ScrollSync = typeof window !== 'undefined' ? window.famous.inputs.ScrollSync : typeof global !== 'undefined' ? global.famous.inputs.ScrollSync : null;
var ViewSequence = typeof window !== 'undefined' ? window.famous.core.ViewSequence : typeof global !== 'undefined' ? global.famous.core.ViewSequence : null;
var Bounds = {
        NONE: 0,
        PREV: 1,
        NEXT: 2,
        BOTH: 3
    };
var SpringSource = {
        NONE: 'none',
        NEXTBOUNDS: 'next-bounds',
        PREVBOUNDS: 'prev-bounds',
        MINSIZE: 'minimal-size',
        GOTOSEQUENCE: 'goto-sequence',
        ENSUREVISIBLE: 'ensure-visible',
        GOTOPREVDIRECTION: 'goto-prev-direction',
        GOTONEXTDIRECTION: 'goto-next-direction'
    };
var PaginationMode = {
        PAGE: 0,
        SCROLL: 1
    };
function ScrollController(options) {
    options = LayoutUtility.combineOptions(ScrollController.DEFAULT_OPTIONS, options);
    var layoutManager = new LayoutNodeManager(options.flow ? FlowLayoutNode : LayoutNode, _initLayoutNode.bind(this));
    LayoutController.call(this, options, layoutManager);
    this._scroll = {
        activeTouches: [],
        pe: new PhysicsEngine(),
        particle: new Particle(this.options.scrollParticle),
        dragForce: new Drag(this.options.scrollDrag),
        frictionForce: new Drag(this.options.scrollFriction),
        springValue: undefined,
        springForce: new Spring(this.options.scrollSpring),
        springEndState: new Vector([
            0,
            0,
            0
        ]),
        groupStart: 0,
        groupTranslate: [
            0,
            0,
            0
        ],
        scrollDelta: 0,
        normalizedScrollDelta: 0,
        scrollForce: 0,
        scrollForceCount: 0,
        unnormalizedScrollOffset: 0,
        isScrolling: false
    };
    this._debug = {
        layoutCount: 0,
        commitCount: 0
    };
    this.group = new Group();
    this.group.add({ render: _innerRender.bind(this) });
    this._scroll.pe.addBody(this._scroll.particle);
    if (!this.options.scrollDrag.disabled) {
        this._scroll.dragForceId = this._scroll.pe.attach(this._scroll.dragForce, this._scroll.particle);
    }
    if (!this.options.scrollFriction.disabled) {
        this._scroll.frictionForceId = this._scroll.pe.attach(this._scroll.frictionForce, this._scroll.particle);
    }
    this._scroll.springForce.setOptions({ anchor: this._scroll.springEndState });
    this._eventInput.on('touchstart', _touchStart.bind(this));
    this._eventInput.on('touchmove', _touchMove.bind(this));
    this._eventInput.on('touchend', _touchEnd.bind(this));
    this._eventInput.on('touchcancel', _touchEnd.bind(this));
    this._eventInput.on('mousedown', _mouseDown.bind(this));
    this._eventInput.on('mouseup', _mouseUp.bind(this));
    this._eventInput.on('mousemove', _mouseMove.bind(this));
    this._scrollSync = new ScrollSync(this.options.scrollSync);
    this._eventInput.pipe(this._scrollSync);
    this._scrollSync.on('update', _scrollUpdate.bind(this));
    if (this.options.useContainer) {
        this.container = new ContainerSurface(this.options.container);
        this.container.add({
            render: function () {
                return this.id;
            }.bind(this)
        });
        if (!this.options.autoPipeEvents) {
            this.subscribe(this.container);
            EventHandler.setInputHandler(this.container, this);
            EventHandler.setOutputHandler(this.container, this);
        }
    }
}
ScrollController.prototype = Object.create(LayoutController.prototype);
ScrollController.prototype.constructor = ScrollController;
ScrollController.Bounds = Bounds;
ScrollController.PaginationMode = PaginationMode;
ScrollController.DEFAULT_OPTIONS = {
    flow: false,
    useContainer: false,
    container: { properties: { overflow: 'hidden' } },
    visibleItemThresshold: 0.5,
    scrollParticle: {},
    scrollDrag: {
        forceFunction: Drag.FORCE_FUNCTIONS.QUADRATIC,
        strength: 0.001,
        disabled: true
    },
    scrollFriction: {
        forceFunction: Drag.FORCE_FUNCTIONS.LINEAR,
        strength: 0.0025,
        disabled: false
    },
    scrollSpring: {
        dampingRatio: 1,
        period: 350
    },
    scrollSync: { scale: 0.2 },
    paginated: false,
    paginationMode: PaginationMode.PAGE,
    paginationEnergyThresshold: 0.01,
    alignment: 0,
    touchMoveDirectionThresshold: undefined,
    touchMoveNoVelocityDuration: 100,
    mouseMove: false,
    enabled: true,
    layoutAll: false,
    alwaysLayout: false,
    extraBoundsSpace: [
        100,
        100
    ],
    debug: false
};
ScrollController.prototype.setOptions = function (options) {
    LayoutController.prototype.setOptions.call(this, options);
    if (this._scroll) {
        if (options.scrollSpring) {
            this._scroll.springForce.setOptions(options.scrollSpring);
        }
        if (options.scrollDrag) {
            this._scroll.dragForce.setOptions(options.scrollDrag);
        }
    }
    if (options.scrollSync && this._scrollSync) {
        this._scrollSync.setOptions(options.scrollSync);
    }
    return this;
};
function _initLayoutNode(node, spec) {
    if (!spec && this.options.insertSpec) {
        node.setSpec(this.options.insertSpec);
    }
}
function _updateSpring() {
    var springValue = this._scroll.scrollForceCount ? undefined : this._scroll.springPosition;
    if (this._scroll.springValue !== springValue) {
        this._scroll.springValue = springValue;
        if (springValue === undefined) {
            if (this._scroll.springForceId !== undefined) {
                this._scroll.pe.detach(this._scroll.springForceId);
                this._scroll.springForceId = undefined;
            }
        } else {
            if (this._scroll.springForceId === undefined) {
                this._scroll.springForceId = this._scroll.pe.attach(this._scroll.springForce, this._scroll.particle);
            }
            this._scroll.springEndState.set1D(springValue);
            this._scroll.pe.wake();
        }
    }
}
function _mouseDown(event) {
    if (!this.options.mouseMove) {
        return;
    }
    if (this._scroll.mouseMove) {
        this.releaseScrollForce(this._scroll.mouseMove.delta);
    }
    var current = [
            event.clientX,
            event.clientY
        ];
    var time = Date.now();
    this._scroll.mouseMove = {
        delta: 0,
        start: current,
        current: current,
        prev: current,
        time: time,
        prevTime: time
    };
    this.applyScrollForce(this._scroll.mouseMove.delta);
}
function _mouseMove(event) {
    if (!this._scroll.mouseMove || !this.options.enabled) {
        return;
    }
    var moveDirection = Math.atan2(Math.abs(event.clientY - this._scroll.mouseMove.prev[1]), Math.abs(event.clientX - this._scroll.mouseMove.prev[0])) / (Math.PI / 2);
    var directionDiff = Math.abs(this._direction - moveDirection);
    if (this.options.touchMoveDirectionThresshold === undefined || directionDiff <= this.options.touchMoveDirectionThresshold) {
        this._scroll.mouseMove.prev = this._scroll.mouseMove.current;
        this._scroll.mouseMove.current = [
            event.clientX,
            event.clientY
        ];
        this._scroll.mouseMove.prevTime = this._scroll.mouseMove.time;
        this._scroll.mouseMove.direction = moveDirection;
        this._scroll.mouseMove.time = Date.now();
    }
    var delta = this._scroll.mouseMove.current[this._direction] - this._scroll.mouseMove.start[this._direction];
    this.updateScrollForce(this._scroll.mouseMove.delta, delta);
    this._scroll.mouseMove.delta = delta;
}
function _mouseUp(event) {
    if (!this._scroll.mouseMove) {
        return;
    }
    var velocity = 0;
    var diffTime = this._scroll.mouseMove.time - this._scroll.mouseMove.prevTime;
    if (diffTime > 0 && Date.now() - this._scroll.mouseMove.time <= this.options.touchMoveNoVelocityDuration) {
        var diffOffset = this._scroll.mouseMove.current[this._direction] - this._scroll.mouseMove.prev[this._direction];
        velocity = diffOffset / diffTime;
    }
    this.releaseScrollForce(this._scroll.mouseMove.delta, velocity);
    this._scroll.mouseMove = undefined;
}
function _touchStart(event) {
    if (!this._touchEndEventListener) {
        this._touchEndEventListener = function (event2) {
            event2.target.removeEventListener('touchend', this._touchEndEventListener);
            _touchEnd.call(this, event2);
        }.bind(this);
    }
    var oldTouchesCount = this._scroll.activeTouches.length;
    var i = 0;
    var j;
    var touchFound;
    while (i < this._scroll.activeTouches.length) {
        var activeTouch = this._scroll.activeTouches[i];
        touchFound = false;
        for (j = 0; j < event.touches.length; j++) {
            var touch = event.touches[j];
            if (touch.identifier === activeTouch.id) {
                touchFound = true;
                break;
            }
        }
        if (!touchFound) {
            this._scroll.activeTouches.splice(i, 1);
        } else {
            i++;
        }
    }
    for (i = 0; i < event.touches.length; i++) {
        var changedTouch = event.touches[i];
        touchFound = false;
        for (j = 0; j < this._scroll.activeTouches.length; j++) {
            if (this._scroll.activeTouches[j].id === changedTouch.identifier) {
                touchFound = true;
                break;
            }
        }
        if (!touchFound) {
            var current = [
                    changedTouch.clientX,
                    changedTouch.clientY
                ];
            var time = Date.now();
            this._scroll.activeTouches.push({
                id: changedTouch.identifier,
                start: current,
                current: current,
                prev: current,
                time: time,
                prevTime: time
            });
            changedTouch.target.addEventListener('touchend', this._touchEndEventListener);
        }
    }
    if (!oldTouchesCount && this._scroll.activeTouches.length) {
        this.applyScrollForce(0);
        this._scroll.touchDelta = 0;
    }
}
function _touchMove(event) {
    if (!this.options.enabled) {
        return;
    }
    var primaryTouch;
    for (var i = 0; i < event.changedTouches.length; i++) {
        var changedTouch = event.changedTouches[i];
        for (var j = 0; j < this._scroll.activeTouches.length; j++) {
            var touch = this._scroll.activeTouches[j];
            if (touch.id === changedTouch.identifier) {
                var moveDirection = Math.atan2(Math.abs(changedTouch.clientY - touch.prev[1]), Math.abs(changedTouch.clientX - touch.prev[0])) / (Math.PI / 2);
                var directionDiff = Math.abs(this._direction - moveDirection);
                if (this.options.touchMoveDirectionThresshold === undefined || directionDiff <= this.options.touchMoveDirectionThresshold) {
                    touch.prev = touch.current;
                    touch.current = [
                        changedTouch.clientX,
                        changedTouch.clientY
                    ];
                    touch.prevTime = touch.time;
                    touch.direction = moveDirection;
                    touch.time = Date.now();
                    primaryTouch = j === 0 ? touch : undefined;
                }
            }
        }
    }
    if (primaryTouch) {
        var delta = primaryTouch.current[this._direction] - primaryTouch.start[this._direction];
        this.updateScrollForce(this._scroll.touchDelta, delta);
        this._scroll.touchDelta = delta;
    }
}
function _touchEnd(event) {
    var primaryTouch = this._scroll.activeTouches.length ? this._scroll.activeTouches[0] : undefined;
    for (var i = 0; i < event.changedTouches.length; i++) {
        var changedTouch = event.changedTouches[i];
        for (var j = 0; j < this._scroll.activeTouches.length; j++) {
            var touch = this._scroll.activeTouches[j];
            if (touch.id === changedTouch.identifier) {
                this._scroll.activeTouches.splice(j, 1);
                if (j === 0 && this._scroll.activeTouches.length) {
                    var newPrimaryTouch = this._scroll.activeTouches[0];
                    newPrimaryTouch.start[0] = newPrimaryTouch.current[0] - (touch.current[0] - touch.start[0]);
                    newPrimaryTouch.start[1] = newPrimaryTouch.current[1] - (touch.current[1] - touch.start[1]);
                }
                break;
            }
        }
    }
    if (!primaryTouch || this._scroll.activeTouches.length) {
        return;
    }
    var velocity = 0;
    var diffTime = primaryTouch.time - primaryTouch.prevTime;
    if (diffTime > 0 && Date.now() - primaryTouch.time <= this.options.touchMoveNoVelocityDuration) {
        var diffOffset = primaryTouch.current[this._direction] - primaryTouch.prev[this._direction];
        velocity = diffOffset / diffTime;
    }
    var delta = this._scroll.touchDelta;
    this.releaseScrollForce(delta, velocity);
    this._scroll.touchDelta = 0;
}
function _scrollUpdate(event) {
    if (!this.options.enabled) {
        return;
    }
    var offset = Array.isArray(event.delta) ? event.delta[this._direction] : event.delta;
    this.scroll(offset);
}
function _setParticle(position, velocity, phase) {
    if (position !== undefined) {
        this._scroll.particleValue = position;
        this._scroll.particle.setPosition1D(position);
    }
    if (velocity !== undefined) {
        var oldVelocity = this._scroll.particle.getVelocity1D();
        if (oldVelocity !== velocity) {
            this._scroll.particle.setVelocity1D(velocity);
        }
    }
}
function _calcScrollOffset(normalize, refreshParticle) {
    if (refreshParticle || this._scroll.particleValue === undefined) {
        this._scroll.particleValue = this._scroll.particle.getPosition1D();
        this._scroll.particleValue = Math.round(this._scroll.particleValue * 1000) / 1000;
    }
    var scrollOffset = this._scroll.particleValue;
    if (this._scroll.scrollDelta || this._scroll.normalizedScrollDelta) {
        scrollOffset += this._scroll.scrollDelta + this._scroll.normalizedScrollDelta;
        if (this._scroll.boundsReached & Bounds.PREV && scrollOffset > this._scroll.springPosition || this._scroll.boundsReached & Bounds.NEXT && scrollOffset < this._scroll.springPosition || this._scroll.boundsReached === Bounds.BOTH) {
            scrollOffset = this._scroll.springPosition;
        }
        if (normalize) {
            if (!this._scroll.scrollDelta) {
                this._scroll.normalizedScrollDelta = 0;
                _setParticle.call(this, scrollOffset, undefined, '_calcScrollOffset');
            }
            this._scroll.normalizedScrollDelta += this._scroll.scrollDelta;
            this._scroll.scrollDelta = 0;
        }
    }
    if (this._scroll.scrollForceCount && this._scroll.scrollForce) {
        if (this._scroll.springPosition !== undefined) {
            scrollOffset = (scrollOffset + this._scroll.scrollForce + this._scroll.springPosition) / 2;
        } else {
            scrollOffset += this._scroll.scrollForce;
        }
    }
    return scrollOffset;
}
ScrollController.prototype._calcScrollHeight = function (next, lastNodeOnly) {
    var calcedHeight = 0;
    var node = this._nodes.getStartEnumNode(next);
    while (node) {
        if (node._invalidated) {
            if (node.trueSizeRequested) {
                calcedHeight = undefined;
                break;
            }
            if (node.scrollLength !== undefined) {
                calcedHeight = lastNodeOnly ? node.scrollLength : calcedHeight + node.scrollLength;
                if (!next && lastNodeOnly) {
                    break;
                }
            }
        }
        node = next ? node._next : node._prev;
    }
    return calcedHeight;
};
function _calcBounds(size, scrollOffset) {
    var prevHeight = this._calcScrollHeight(false);
    var nextHeight = this._calcScrollHeight(true);
    var enforeMinSize = this._layout.capabilities && this._layout.capabilities.sequentialScrollingOptimized;
    if (prevHeight === undefined || nextHeight === undefined) {
        this._scroll.boundsReached = Bounds.NONE;
        this._scroll.springPosition = undefined;
        this._scroll.springSource = SpringSource.NONE;
        return;
    }
    var totalHeight;
    if (enforeMinSize) {
        if (nextHeight !== undefined && prevHeight !== undefined) {
            totalHeight = prevHeight + nextHeight;
        }
        if (totalHeight !== undefined && totalHeight <= size[this._direction]) {
            this._scroll.boundsReached = Bounds.BOTH;
            this._scroll.springPosition = this.options.alignment ? -nextHeight : prevHeight;
            this._scroll.springSource = SpringSource.MINSIZE;
            return;
        }
    }
    if (this.options.alignment) {
        if (enforeMinSize) {
            if (nextHeight !== undefined && scrollOffset + nextHeight <= 0) {
                this._scroll.boundsReached = Bounds.NEXT;
                this._scroll.springPosition = -nextHeight;
                this._scroll.springSource = SpringSource.NEXTBOUNDS;
                return;
            }
        } else {
            var firstPrevItemHeight = this._calcScrollHeight(false, true);
            if (nextHeight !== undefined && firstPrevItemHeight && scrollOffset + nextHeight + size[this._direction] <= firstPrevItemHeight) {
                this._scroll.boundsReached = Bounds.NEXT;
                this._scroll.springPosition = nextHeight - (size[this._direction] - firstPrevItemHeight);
                this._scroll.springSource = SpringSource.NEXTBOUNDS;
                return;
            }
        }
    } else {
        if (prevHeight !== undefined && scrollOffset - prevHeight >= 0) {
            this._scroll.boundsReached = Bounds.PREV;
            this._scroll.springPosition = prevHeight;
            this._scroll.springSource = SpringSource.PREVBOUNDS;
            return;
        }
    }
    if (this.options.alignment) {
        if (prevHeight !== undefined && scrollOffset - prevHeight >= -size[this._direction]) {
            this._scroll.boundsReached = Bounds.PREV;
            this._scroll.springPosition = -size[this._direction] + prevHeight;
            this._scroll.springSource = SpringSource.PREVBOUNDS;
            return;
        }
    } else {
        var nextBounds = enforeMinSize ? size[this._direction] : this._calcScrollHeight(true, true);
        if (nextHeight !== undefined && scrollOffset + nextHeight <= nextBounds) {
            this._scroll.boundsReached = Bounds.NEXT;
            this._scroll.springPosition = nextBounds - nextHeight;
            this._scroll.springSource = SpringSource.NEXTBOUNDS;
            return;
        }
    }
    this._scroll.boundsReached = Bounds.NONE;
    this._scroll.springPosition = undefined;
    this._scroll.springSource = SpringSource.NONE;
}
function _calcScrollToOffset(size, scrollOffset) {
    var scrollToRenderNode = this._scroll.scrollToRenderNode || this._scroll.ensureVisibleRenderNode;
    if (!scrollToRenderNode) {
        return;
    }
    if (this._scroll.boundsReached === Bounds.BOTH || !this._scroll.scrollToDirection && this._scroll.boundsReached === Bounds.PREV || this._scroll.scrollToDirection && this._scroll.boundsReached === Bounds.NEXT) {
        return;
    }
    var foundNode;
    var scrollToOffset = 0;
    var node = this._nodes.getStartEnumNode(true);
    var count = 0;
    while (node) {
        count++;
        if (!node._invalidated || node.scrollLength === undefined) {
            break;
        }
        if (this.options.alignment) {
            scrollToOffset -= node.scrollLength;
        }
        if (node.renderNode === scrollToRenderNode) {
            foundNode = node;
            break;
        }
        if (!this.options.alignment) {
            scrollToOffset -= node.scrollLength;
        }
        node = node._next;
    }
    if (!foundNode) {
        scrollToOffset = 0;
        node = this._nodes.getStartEnumNode(false);
        while (node) {
            if (!node._invalidated || node.scrollLength === undefined) {
                break;
            }
            if (!this.options.alignment) {
                scrollToOffset += node.scrollLength;
            }
            if (node.renderNode === scrollToRenderNode) {
                foundNode = node;
                break;
            }
            if (this.options.alignment) {
                scrollToOffset += node.scrollLength;
            }
            node = node._prev;
        }
    }
    if (foundNode) {
        if (this._scroll.ensureVisibleSequence) {
            if (this.options.alignment) {
                if (scrollToOffset - foundNode.scrollLength < 0) {
                    this._scroll.springPosition = scrollToOffset;
                    this._scroll.springSource = SpringSource.ENSUREVISIBLE;
                } else if (scrollToOffset > size[this._direction]) {
                    this._scroll.springPosition = size[this._direction] - scrollToOffset;
                    this._scroll.springSource = SpringSource.ENSUREVISIBLE;
                } else {
                    this._scroll.ensureVisibleRenderNode = undefined;
                }
            } else {
                scrollToOffset = -scrollToOffset;
                if (scrollToOffset < 0) {
                    this._scroll.springPosition = scrollToOffset;
                    this._scroll.springSource = SpringSource.ENSUREVISIBLE;
                } else if (scrollToOffset + foundNode.scrollLength > size[this._direction]) {
                    this._scroll.springPosition = size[this._direction] - (scrollToOffset + foundNode.scrollLength);
                    this._scroll.springSource = SpringSource.ENSUREVISIBLE;
                } else {
                    this._scroll.ensureVisibleRenderNode = undefined;
                }
            }
        } else {
            this._scroll.springPosition = scrollToOffset;
            this._scroll.springSource = SpringSource.GOTOSEQUENCE;
        }
        return;
    }
    if (this._scroll.scrollToDirection) {
        this._scroll.springPosition = scrollOffset - size[this._direction];
        this._scroll.springSource = SpringSource.GOTONEXTDIRECTION;
    } else {
        this._scroll.springPosition = scrollOffset + size[this._direction];
        this._scroll.springSource = SpringSource.GOTOPREVDIRECTION;
    }
    if (this._viewSequence.cleanup) {
        var viewSequence = this._viewSequence;
        while (viewSequence.get() !== scrollToRenderNode) {
            viewSequence = this._scroll.scrollToDirection ? viewSequence.getNext(true) : viewSequence.getPrevious(true);
            if (!viewSequence) {
                break;
            }
        }
    }
}
function _snapToPage() {
    if (!this.options.paginated || this._scroll.scrollForceCount || this._scroll.springPosition !== undefined) {
        return;
    }
    var item;
    switch (this.options.paginationMode) {
    case PaginationMode.SCROLL:
        if (!this.options.paginationEnergyThresshold || Math.abs(this._scroll.particle.getEnergy()) <= this.options.paginationEnergyThresshold) {
            item = this.options.alignment ? this.getLastVisibleItem() : this.getFirstVisibleItem();
            if (item && item.renderNode) {
                this.goToRenderNode(item.renderNode);
            }
        }
        break;
    case PaginationMode.PAGE:
        item = this.options.alignment ? this.getLastVisibleItem() : this.getFirstVisibleItem();
        if (item && item.renderNode) {
            this.goToRenderNode(item.renderNode);
        }
        break;
    }
}
function _normalizePrevViewSequence(scrollOffset) {
    var count = 0;
    var normalizedScrollOffset = scrollOffset;
    var normalizeNextPrev = false;
    var node = this._nodes.getStartEnumNode(false);
    while (node) {
        if (!node._invalidated || !node._viewSequence) {
            break;
        }
        if (normalizeNextPrev) {
            this._viewSequence = node._viewSequence;
            normalizedScrollOffset = scrollOffset;
            normalizeNextPrev = false;
        }
        if (node.scrollLength === undefined || node.trueSizeRequested || scrollOffset < 0) {
            break;
        }
        scrollOffset -= node.scrollLength;
        count++;
        if (node.scrollLength) {
            if (this.options.alignment) {
                normalizeNextPrev = scrollOffset >= 0;
            } else {
                this._viewSequence = node._viewSequence;
                normalizedScrollOffset = scrollOffset;
            }
        }
        node = node._prev;
    }
    return normalizedScrollOffset;
}
function _normalizeNextViewSequence(scrollOffset) {
    var count = 0;
    var normalizedScrollOffset = scrollOffset;
    var node = this._nodes.getStartEnumNode(true);
    while (node) {
        if (!node._invalidated || node.scrollLength === undefined || node.trueSizeRequested || !node._viewSequence || scrollOffset > 0 && (!this.options.alignment || node.scrollLength !== 0)) {
            break;
        }
        if (this.options.alignment) {
            scrollOffset += node.scrollLength;
            count++;
        }
        if (node.scrollLength || this.options.alignment) {
            this._viewSequence = node._viewSequence;
            normalizedScrollOffset = scrollOffset;
        }
        if (!this.options.alignment) {
            scrollOffset += node.scrollLength;
            count++;
        }
        node = node._next;
    }
    return normalizedScrollOffset;
}
function _normalizeViewSequence(size, scrollOffset) {
    var caps = this._layout.capabilities;
    if (caps && caps.debug && caps.debug.normalize !== undefined && !caps.debug.normalize) {
        return scrollOffset;
    }
    if (this._scroll.scrollForceCount) {
        return scrollOffset;
    }
    var normalizedScrollOffset = scrollOffset;
    if (this.options.alignment && scrollOffset < 0) {
        normalizedScrollOffset = _normalizeNextViewSequence.call(this, scrollOffset);
    } else if (!this.options.alignment && scrollOffset > 0) {
        normalizedScrollOffset = _normalizePrevViewSequence.call(this, scrollOffset);
    }
    if (normalizedScrollOffset === scrollOffset) {
        if (this.options.alignment && scrollOffset > 0) {
            normalizedScrollOffset = _normalizePrevViewSequence.call(this, scrollOffset);
        } else if (!this.options.alignment && scrollOffset < 0) {
            normalizedScrollOffset = _normalizeNextViewSequence.call(this, scrollOffset);
        }
    }
    if (normalizedScrollOffset !== scrollOffset) {
        var delta = normalizedScrollOffset - scrollOffset;
        var particleValue = this._scroll.particle.getPosition1D();
        _setParticle.call(this, particleValue + delta, undefined, 'normalize');
        if (this._scroll.springPosition !== undefined) {
            this._scroll.springPosition += delta;
        }
        if (caps && caps.sequentialScrollingOptimized) {
            this._scroll.groupStart -= delta;
        }
    }
    return normalizedScrollOffset;
}
ScrollController.prototype.getVisibleItems = function () {
    var size = this._contextSizeCache;
    var scrollOffset = this.options.alignment ? this._scroll.unnormalizedScrollOffset + size[this._direction] : this._scroll.unnormalizedScrollOffset;
    var result = [];
    var node = this._nodes.getStartEnumNode(true);
    while (node) {
        if (!node._invalidated || node.scrollLength === undefined || scrollOffset > size[this._direction]) {
            break;
        }
        scrollOffset += node.scrollLength;
        if (scrollOffset >= 0 && node._viewSequence) {
            result.push({
                index: node._viewSequence.getIndex(),
                viewSequence: node._viewSequence,
                renderNode: node.renderNode,
                visiblePerc: node.scrollLength ? (Math.min(scrollOffset, size[this._direction]) - Math.max(scrollOffset - node.scrollLength, 0)) / node.scrollLength : 1,
                scrollOffset: scrollOffset - node.scrollLength,
                scrollLength: node.scrollLength,
                _node: node
            });
        }
        node = node._next;
    }
    scrollOffset = this.options.alignment ? this._scroll.unnormalizedScrollOffset + size[this._direction] : this._scroll.unnormalizedScrollOffset;
    node = this._nodes.getStartEnumNode(false);
    while (node) {
        if (!node._invalidated || node.scrollLength === undefined || scrollOffset < 0) {
            break;
        }
        scrollOffset -= node.scrollLength;
        if (scrollOffset < size[this._direction] && node._viewSequence) {
            result.unshift({
                index: node._viewSequence.getIndex(),
                viewSequence: node._viewSequence,
                renderNode: node.renderNode,
                visiblePerc: node.scrollLength ? (Math.min(scrollOffset + node.scrollLength, size[this._direction]) - Math.max(scrollOffset, 0)) / node.scrollLength : 1,
                scrollOffset: scrollOffset,
                scrollLength: node.scrollLength,
                _node: node
            });
        }
        node = node._prev;
    }
    return result;
};
ScrollController.prototype.getFirstVisibleItem = function (includeNode) {
    var size = this._contextSizeCache;
    var scrollOffset = this.options.alignment ? this._scroll.unnormalizedScrollOffset + size[this._direction] : this._scroll.unnormalizedScrollOffset;
    var node = this._nodes.getStartEnumNode(true);
    var nodeFoundVisiblePerc;
    var nodeFoundScrollOffset;
    var nodeFound;
    while (node) {
        if (!node._invalidated || node.scrollLength === undefined || scrollOffset > size[this._direction]) {
            break;
        }
        scrollOffset += node.scrollLength;
        if (scrollOffset >= 0 && node._viewSequence) {
            nodeFoundVisiblePerc = node.scrollLength ? (Math.min(scrollOffset, size[this._direction]) - Math.max(scrollOffset - node.scrollLength, 0)) / node.scrollLength : 1;
            nodeFoundScrollOffset = scrollOffset - node.scrollLength;
            if (nodeFoundVisiblePerc >= this.options.visibleItemThresshold || nodeFoundScrollOffset >= 0) {
                nodeFound = node;
                break;
            }
        }
        node = node._next;
    }
    scrollOffset = this.options.alignment ? this._scroll.unnormalizedScrollOffset + size[this._direction] : this._scroll.unnormalizedScrollOffset;
    node = this._nodes.getStartEnumNode(false);
    while (node) {
        if (!node._invalidated || node.scrollLength === undefined || scrollOffset < 0) {
            break;
        }
        scrollOffset -= node.scrollLength;
        if (scrollOffset < size[this._direction] && node._viewSequence) {
            var visiblePerc = node.scrollLength ? (Math.min(scrollOffset + node.scrollLength, size[this._direction]) - Math.max(scrollOffset, 0)) / node.scrollLength : 1;
            if (visiblePerc >= this.options.visibleItemThresshold || scrollOffset >= 0) {
                nodeFoundVisiblePerc = visiblePerc;
                nodeFoundScrollOffset = scrollOffset;
                nodeFound = node;
                break;
            }
        }
        node = node._prev;
    }
    return nodeFound ? {
        index: nodeFound._viewSequence.getIndex(),
        viewSequence: nodeFound._viewSequence,
        renderNode: nodeFound.renderNode,
        visiblePerc: nodeFoundVisiblePerc,
        scrollOffset: nodeFoundScrollOffset,
        scrollLength: nodeFound.scrollLength,
        _node: nodeFound
    } : undefined;
};
ScrollController.prototype.getLastVisibleItem = function () {
    var items = this.getVisibleItems();
    var size = this._contextSizeCache;
    for (var i = items.length - 1; i >= 0; i--) {
        var item = items[i];
        if (item.visiblePerc >= this.options.visibleItemThresshold || item.scrollOffset + item.scrollLength <= size[this._direction]) {
            return item;
        }
    }
    return items.length ? items[items.length - 1] : undefined;
};
function _scrollToSequence(viewSequence, next) {
    this._scroll.scrollToSequence = viewSequence;
    this._scroll.scrollToRenderNode = viewSequence.get();
    this._scroll.ensureVisibleRenderNode = undefined;
    this._scroll.scrollToDirection = next;
    this._scroll.scrollDirty = true;
}
function _ensureVisibleSequence(viewSequence, next) {
    this._scroll.scrollToSequence = undefined;
    this._scroll.scrollToRenderNode = undefined;
    this._scroll.ensureVisibleRenderNode = viewSequence.get();
    this._scroll.scrollToDirection = next;
    this._scroll.scrollDirty = true;
}
function _goToPage(amount) {
    var viewSequence = this._scroll.scrollToSequence || this._viewSequence;
    if (!this._scroll.scrollToSequence) {
        var firstVisibleItem = this.getFirstVisibleItem();
        if (firstVisibleItem) {
            viewSequence = firstVisibleItem.viewSequence;
            if (amount < 0 && firstVisibleItem.scrollOffset < 0 || amount > 0 && firstVisibleItem.scrollOffset > 0) {
                amount = 0;
            }
        }
    }
    if (!viewSequence) {
        return;
    }
    for (var i = 0; i < Math.abs(amount); i++) {
        var nextViewSequence = amount > 0 ? viewSequence.getNext() : viewSequence.getPrevious();
        if (nextViewSequence) {
            viewSequence = nextViewSequence;
        } else {
            break;
        }
    }
    _scrollToSequence.call(this, viewSequence, amount >= 0);
}
ScrollController.prototype.goToFirstPage = function () {
    if (!this._viewSequence) {
        return this;
    }
    if (this._viewSequence._ && this._viewSequence._.loop) {
        LayoutUtility.error('Unable to go to first item of looped ViewSequence');
        return this;
    }
    var viewSequence = this._viewSequence;
    while (viewSequence) {
        var prev = viewSequence.getPrevious();
        if (prev && prev.get()) {
            viewSequence = prev;
        } else {
            break;
        }
    }
    _scrollToSequence.call(this, viewSequence, false);
    return this;
};
ScrollController.prototype.goToPreviousPage = function () {
    _goToPage.call(this, -1);
    return this;
};
ScrollController.prototype.goToNextPage = function () {
    _goToPage.call(this, 1);
    return this;
};
ScrollController.prototype.goToLastPage = function () {
    if (!this._viewSequence) {
        return this;
    }
    if (this._viewSequence._ && this._viewSequence._.loop) {
        LayoutUtility.error('Unable to go to last item of looped ViewSequence');
        return this;
    }
    var viewSequence = this._viewSequence;
    while (viewSequence) {
        var next = viewSequence.getNext();
        if (next && next.get()) {
            viewSequence = next;
        } else {
            break;
        }
    }
    _scrollToSequence.call(this, viewSequence, true);
    return this;
};
ScrollController.prototype.goToRenderNode = function (node) {
    if (!this._viewSequence || !node) {
        return this;
    }
    if (this._viewSequence.get() === node) {
        var next = _calcScrollOffset.call(this) >= 0;
        _scrollToSequence.call(this, this._viewSequence, next);
        return this;
    }
    var nextSequence = this._viewSequence.getNext();
    var prevSequence = this._viewSequence.getPrevious();
    while ((nextSequence || prevSequence) && nextSequence !== this._viewSequence) {
        var nextNode = nextSequence ? nextSequence.get() : undefined;
        if (nextNode === node) {
            _scrollToSequence.call(this, nextSequence, true);
            break;
        }
        var prevNode = prevSequence ? prevSequence.get() : undefined;
        if (prevNode === node) {
            _scrollToSequence.call(this, prevSequence, false);
            break;
        }
        nextSequence = nextNode ? nextSequence.getNext() : undefined;
        prevSequence = prevNode ? prevSequence.getPrevious() : undefined;
    }
    return this;
};
ScrollController.prototype.ensureVisible = function (node) {
    if (node instanceof ViewSequence) {
        node = node.get();
    } else if (node instanceof Number || typeof node === 'number') {
        var viewSequence = this._viewSequence;
        while (viewSequence.getIndex() < node) {
            viewSequence = viewSequence.getNext();
            if (!viewSequence) {
                return this;
            }
        }
        while (viewSequence.getIndex() > node) {
            viewSequence = viewSequence.getPrevious();
            if (!viewSequence) {
                return this;
            }
        }
    }
    if (this._viewSequence.get() === node) {
        var next = _calcScrollOffset.call(this) >= 0;
        _ensureVisibleSequence.call(this, this._viewSequence, next);
        return this;
    }
    var nextSequence = this._viewSequence.getNext();
    var prevSequence = this._viewSequence.getPrevious();
    while ((nextSequence || prevSequence) && nextSequence !== this._viewSequence) {
        var nextNode = nextSequence ? nextSequence.get() : undefined;
        if (nextNode === node) {
            _ensureVisibleSequence.call(this, nextSequence, true);
            break;
        }
        var prevNode = prevSequence ? prevSequence.get() : undefined;
        if (prevNode === node) {
            _ensureVisibleSequence.call(this, prevSequence, false);
            break;
        }
        nextSequence = nextNode ? nextSequence.getNext() : undefined;
        prevSequence = prevNode ? prevSequence.getPrevious() : undefined;
    }
    return this;
};
ScrollController.prototype.scroll = function (delta) {
    this.halt();
    this._scroll.scrollDelta += delta;
    return this;
};
ScrollController.prototype.canScroll = function (delta) {
    var scrollOffset = _calcScrollOffset.call(this);
    var prevHeight = this._calcScrollHeight(false);
    var nextHeight = this._calcScrollHeight(true);
    var totalHeight;
    if (nextHeight !== undefined && prevHeight !== undefined) {
        totalHeight = prevHeight + nextHeight;
    }
    if (totalHeight !== undefined && totalHeight <= this._contextSizeCache[this._direction]) {
        return 0;
    }
    if (delta < 0 && nextHeight !== undefined) {
        var nextOffset = this._contextSizeCache[this._direction] - (scrollOffset + nextHeight);
        return Math.max(nextOffset, delta);
    } else if (delta > 0 && prevHeight !== undefined) {
        var prevOffset = -(scrollOffset - prevHeight);
        return Math.min(prevOffset, delta);
    }
    return delta;
};
ScrollController.prototype.halt = function () {
    this._scroll.scrollToSequence = undefined;
    this._scroll.scrollToRenderNode = undefined;
    this._scroll.ensureVisibleRenderNode = undefined;
    _setParticle.call(this, undefined, 0, 'halt');
    return this;
};
ScrollController.prototype.isScrolling = function () {
    return this._scroll.isScrolling;
};
ScrollController.prototype.getBoundsReached = function () {
    return this._scroll.boundsReached;
};
ScrollController.prototype.getVelocity = function () {
    return this._scroll.particle.getVelocity1D();
};
ScrollController.prototype.setVelocity = function (velocity) {
    return this._scroll.particle.setVelocity1D(velocity);
};
ScrollController.prototype.applyScrollForce = function (delta) {
    this.halt();
    if (this._scroll.scrollForceCount === 0) {
        this._scroll.scrollForceStartItem = this.alignment ? this.getLastVisibleItem() : this.getFirstVisibleItem();
    }
    this._scroll.scrollForceCount++;
    this._scroll.scrollForce += delta;
    return this;
};
ScrollController.prototype.updateScrollForce = function (prevDelta, newDelta) {
    this.halt();
    newDelta -= prevDelta;
    this._scroll.scrollForce += newDelta;
    return this;
};
ScrollController.prototype.releaseScrollForce = function (delta, velocity) {
    this.halt();
    if (this._scroll.scrollForceCount === 1) {
        var scrollOffset = _calcScrollOffset.call(this);
        _setParticle.call(this, scrollOffset, velocity, 'releaseScrollForce');
        this._scroll.pe.wake();
        this._scroll.scrollForce = 0;
        this._scroll.scrollDirty = true;
        if (this._scroll.scrollForceStartItem && this.options.paginated && this.options.paginationMode === PaginationMode.PAGE) {
            var item = this.alignment ? this.getLastVisibleItem() : this.getFirstVisibleItem();
            if (item.renderNode !== this._scroll.scrollForceStartItem.renderNode) {
                this.goToRenderNode(item.renderNode);
            } else if (this.options.paginationEnergyThresshold && Math.abs(this._scroll.particle.getEnergy()) >= this.options.paginationEnergyThresshold) {
                velocity = velocity || 0;
                if (velocity < 0 && item._node._next && item._node._next.renderNode) {
                    this.goToRenderNode(item._node._next.renderNode);
                } else if (velocity >= 0 && item._node._prev && item._node._prev.renderNode) {
                    this.goToRenderNode(item._node._prev.renderNode);
                }
            } else {
                this.goToRenderNode(item.renderNode);
            }
        }
        this._scroll.scrollForceStartItem = undefined;
    } else {
        this._scroll.scrollForce -= delta;
    }
    this._scroll.scrollForceCount--;
    return this;
};
ScrollController.prototype.getSpec = function (node, normalize) {
    var spec = LayoutController.prototype.getSpec.apply(this, arguments);
    if (spec && this._layout.capabilities && this._layout.capabilities.sequentialScrollingOptimized) {
        spec = {
            origin: spec.origin,
            align: spec.align,
            opacity: spec.opacity,
            size: spec.size,
            renderNode: spec.renderNode,
            transform: spec.transform
        };
        var translate = [
                0,
                0,
                0
            ];
        translate[this._direction] = this._scrollOffsetCache + this._scroll.groupStart;
        spec.transform = Transform.thenMove(spec.transform, translate);
    }
    return spec;
};
function _layout(size, scrollOffset, nested) {
    this._debug.layoutCount++;
    var scrollStart = 0 - Math.max(this.options.extraBoundsSpace[0], 1);
    var scrollEnd = size[this._direction] + Math.max(this.options.extraBoundsSpace[1], 1);
    if (this.options.layoutAll) {
        scrollStart = -1000000;
        scrollEnd = 1000000;
    }
    var layoutContext = this._nodes.prepareForLayout(this._viewSequence, this._nodesById, {
            size: size,
            direction: this._direction,
            reverse: this.options.alignment ? true : false,
            scrollOffset: this.options.alignment ? scrollOffset + size[this._direction] : scrollOffset,
            scrollStart: scrollStart,
            scrollEnd: scrollEnd
        });
    if (this._layout._function) {
        this._layout._function(layoutContext, this._layout.options);
    }
    this._scroll.unnormalizedScrollOffset = scrollOffset;
    if (this._postLayout) {
        this._postLayout(size, scrollOffset);
    }
    this._nodes.removeNonInvalidatedNodes(this.options.removeSpec);
    _calcBounds.call(this, size, scrollOffset);
    _calcScrollToOffset.call(this, size, scrollOffset);
    _snapToPage.call(this);
    var newScrollOffset = _calcScrollOffset.call(this, true);
    if (!nested && newScrollOffset !== scrollOffset) {
        return _layout.call(this, size, newScrollOffset, true);
    }
    scrollOffset = _normalizeViewSequence.call(this, size, scrollOffset);
    _updateSpring.call(this);
    this._nodes.removeVirtualViewSequenceNodes();
    return scrollOffset;
}
function _innerRender() {
    var specs = this._specs;
    for (var i3 = 0, j3 = specs.length; i3 < j3; i3++) {
        specs[i3].target = specs[i3].renderNode.render();
    }
    return specs;
}
ScrollController.prototype.commit = function commit(context) {
    var size = context.size;
    this._debug.commitCount++;
    var scrollOffset = _calcScrollOffset.call(this, true, true);
    if (this._scrollOffsetCache === undefined) {
        this._scrollOffsetCache = scrollOffset;
    }
    var emitEndScrollingEvent = false;
    var emitScrollEvent = false;
    var eventData;
    if (size[0] !== this._contextSizeCache[0] || size[1] !== this._contextSizeCache[1] || this._isDirty || this._scroll.scrollDirty || this._nodes._trueSizeRequested || this.options.alwaysLayout || this._scrollOffsetCache !== scrollOffset) {
        eventData = {
            target: this,
            oldSize: this._contextSizeCache,
            size: size,
            oldScrollOffset: this._scrollOffsetCache,
            scrollOffset: scrollOffset
        };
        if (this._scrollOffsetCache !== scrollOffset) {
            if (!this._scroll.isScrolling) {
                this._scroll.isScrolling = true;
                this._eventOutput.emit('scrollstart', eventData);
            }
            emitScrollEvent = true;
        }
        this._eventOutput.emit('layoutstart', eventData);
        if (this.options.flow && (this._isDirty || this.options.reflowOnResize && (size[0] !== this._contextSizeCache[0] || size[1] !== this._contextSizeCache[1]))) {
            var node = this._nodes.getStartEnumNode();
            while (node) {
                node.releaseLock();
                node = node._next;
            }
        }
        this._contextSizeCache[0] = size[0];
        this._contextSizeCache[1] = size[1];
        this._isDirty = false;
        this._scroll.scrollDirty = false;
        scrollOffset = _layout.call(this, size, scrollOffset);
        this._scrollOffsetCache = scrollOffset;
        eventData.scrollOffset = this._scrollOffsetCache;
        this._eventOutput.emit('layoutend', eventData);
    } else if (this._scroll.isScrolling && !this._scroll.scrollForceCount) {
        emitEndScrollingEvent = true;
    }
    var groupTranslate = this._scroll.groupTranslate;
    groupTranslate[0] = 0;
    groupTranslate[1] = 0;
    groupTranslate[2] = 0;
    groupTranslate[this._direction] = -this._scroll.groupStart - scrollOffset;
    var sequentialScrollingOptimized = this._layout.capabilities ? this._layout.capabilities.sequentialScrollingOptimized : false;
    var result = this._nodes.buildSpecAndDestroyUnrenderedNodes(sequentialScrollingOptimized ? groupTranslate : undefined);
    this._specs = result.specs;
    if (result.modified) {
        this._eventOutput.emit('reflow', { target: this });
    }
    if (emitScrollEvent) {
        this._eventOutput.emit('scroll', eventData);
    }
    if (eventData) {
        var visibleItem = this.options.alignment ? this.getLastVisibleItem() : this.getFirstVisibleItem();
        if (visibleItem && !this._visibleItemCache || !visibleItem && this._visibleItemCache || visibleItem && this._visibleItemCache && visibleItem.renderNode !== this._visibleItemCache.renderNode) {
            this._eventOutput.emit('pagechange', {
                target: this,
                oldViewSequence: this._visibleItemCache ? this._visibleItemCache.viewSequence : undefined,
                viewSequence: visibleItem ? visibleItem.viewSequence : undefined,
                oldIndex: this._visibleItemCache ? this._visibleItemCache.index : undefined,
                index: visibleItem ? visibleItem.index : undefined,
                renderNode: visibleItem ? visibleItem.renderNode : undefined,
                oldRenderNode: this._visibleItemCache ? this._visibleItemCache.renderNode : undefined
            });
            this._visibleItemCache = visibleItem;
        }
    }
    if (emitEndScrollingEvent) {
        this._scroll.isScrolling = false;
        eventData = {
            target: this,
            oldSize: size,
            size: size,
            oldScrollOffset: scrollOffset,
            scrollOffset: scrollOffset
        };
        this._eventOutput.emit('scrollend', eventData);
    }
    var transform = context.transform;
    if (sequentialScrollingOptimized) {
        var windowOffset = scrollOffset + this._scroll.groupStart;
        var translate = [
                0,
                0,
                0
            ];
        translate[this._direction] = windowOffset;
        transform = Transform.thenMove(transform, translate);
    }
    return {
        transform: transform,
        size: size,
        opacity: context.opacity,
        origin: context.origin,
        target: this.group.render()
    };
};
ScrollController.prototype.render = function render() {
    if (this.container) {
        return this.container.render.apply(this.container, arguments);
    } else {
        return this.id;
    }
};
module.exports = ScrollController;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./FlowLayoutNode":3,"./LayoutController":5,"./LayoutNode":6,"./LayoutNodeManager":7,"./LayoutUtility":8}],10:[function(require,module,exports){
(function (global){
var EventHandler = typeof window !== 'undefined' ? window.famous.core.EventHandler : typeof global !== 'undefined' ? global.famous.core.EventHandler : null;
function VirtualViewSequence(options) {
    options = options || {};
    this._ = options._ || new this.constructor.Backing(options);
    this.touched = true;
    this.value = options.value || this._.factory.create();
    this.index = options.index || 0;
    this.next = options.next;
    this.prev = options.prev;
    EventHandler.setOutputHandler(this, this._.eventOutput);
    this.value.pipe(this._.eventOutput);
}
VirtualViewSequence.Backing = function Backing(options) {
    this.factory = options.factory;
    this.eventOutput = new EventHandler();
};
VirtualViewSequence.prototype.getPrevious = function (noCreate) {
    if (this.prev) {
        this.prev.touched = true;
        return this.prev;
    }
    if (noCreate) {
        return undefined;
    }
    var value = this._.factory.createPrevious(this.get());
    if (!value) {
        return undefined;
    }
    this.prev = new VirtualViewSequence({
        _: this._,
        value: value,
        index: this.index - 1,
        next: this
    });
    return this.prev;
};
VirtualViewSequence.prototype.getNext = function (noCreate) {
    if (this.next) {
        this.next.touched = true;
        return this.next;
    }
    if (noCreate) {
        return undefined;
    }
    var value = this._.factory.createNext(this.get());
    if (!value) {
        return undefined;
    }
    this.next = new VirtualViewSequence({
        _: this._,
        value: value,
        index: this.index + 1,
        prev: this
    });
    return this.next;
};
VirtualViewSequence.prototype.get = function () {
    this.touched = true;
    return this.value;
};
VirtualViewSequence.prototype.getIndex = function () {
    this.touched = true;
    return this.index;
};
VirtualViewSequence.prototype.toString = function () {
    return '' + this.index;
};
VirtualViewSequence.prototype.cleanup = function () {
    var node = this.prev;
    while (node) {
        if (!node.touched) {
            node.next.prev = undefined;
            node.next = undefined;
            if (this._.factory.destroy) {
                while (node) {
                    this._.factory.destroy(node.value);
                    node = node.prev;
                }
            }
            break;
        }
        node.touched = false;
        node = node.prev;
    }
    node = this.next;
    while (node) {
        if (!node.touched) {
            node.prev.next = undefined;
            node.prev = undefined;
            if (this._.factory.destroy) {
                while (node) {
                    this._.factory.destroy(node.value);
                    node = node.next;
                }
            }
            break;
        }
        node.touched = false;
        node = node.next;
    }
    return this;
};
VirtualViewSequence.prototype.unshift = function () {
    if (console.error) {
        console.error('VirtualViewSequence.unshift is not supported and should not be called');
    }
};
VirtualViewSequence.prototype.push = function () {
    if (console.error) {
        console.error('VirtualViewSequence.push is not supported and should not be called');
    }
};
VirtualViewSequence.prototype.splice = function () {
    if (console.error) {
        console.error('VirtualViewSequence.splice is not supported and should not be called');
    }
};
VirtualViewSequence.prototype.swap = function () {
    if (console.error) {
        console.error('VirtualViewSequence.swap is not supported and should not be called');
    }
};
module.exports = VirtualViewSequence;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],11:[function(require,module,exports){
var LayoutUtility = require('../LayoutUtility');
function LayoutDockHelper(context, options) {
    var size = context.size;
    this._size = size;
    this._context = context;
    this._options = options;
    this._z = options && options.translateZ ? options.translateZ : 0;
    if (options && options.margins) {
        var margins = LayoutUtility.normalizeMargins(options.margins);
        this._left = margins[3];
        this._top = margins[0];
        this._right = size[0] - margins[1];
        this._bottom = size[1] - margins[2];
    } else {
        this._left = 0;
        this._top = 0;
        this._right = size[0];
        this._bottom = size[1];
    }
}
LayoutDockHelper.prototype.parse = function (data) {
    for (var i = 0; i < data.length; i++) {
        var rule = data[i];
        var value = rule.length >= 3 ? rule[2] : undefined;
        if (rule[0] === 'top') {
            this.top(rule[1], value, rule.length >= 4 ? rule[3] : undefined);
        } else if (rule[0] === 'left') {
            this.left(rule[1], value, rule.length >= 4 ? rule[3] : undefined);
        } else if (rule[0] === 'right') {
            this.right(rule[1], value, rule.length >= 4 ? rule[3] : undefined);
        } else if (rule[0] === 'bottom') {
            this.bottom(rule[1], value, rule.length >= 4 ? rule[3] : undefined);
        } else if (rule[0] === 'fill') {
            this.fill(rule[1], rule.length >= 3 ? rule[2] : undefined);
        } else if (rule[0] === 'margins') {
            this.margins(rule[1]);
        }
    }
};
LayoutDockHelper.prototype.top = function (node, height, z) {
    if (height instanceof Array) {
        height = height[1];
    }
    if (height === undefined) {
        var size = this._context.resolveSize(node, [
                this._right - this._left,
                this._bottom - this._top
            ]);
        height = size[1];
    }
    this._context.set(node, {
        size: [
            this._right - this._left,
            height
        ],
        origin: [
            0,
            0
        ],
        align: [
            0,
            0
        ],
        translate: [
            this._left,
            this._top,
            z === undefined ? this._z : z
        ]
    });
    this._top += height;
    return this;
};
LayoutDockHelper.prototype.left = function (node, width, z) {
    if (width instanceof Array) {
        width = width[0];
    }
    if (width === undefined) {
        var size = this._context.resolveSize(node, [
                this._right - this._left,
                this._bottom - this._top
            ]);
        width = size[0];
    }
    this._context.set(node, {
        size: [
            width,
            this._bottom - this._top
        ],
        origin: [
            0,
            0
        ],
        align: [
            0,
            0
        ],
        translate: [
            this._left,
            this._top,
            z === undefined ? this._z : z
        ]
    });
    this._left += width;
    return this;
};
LayoutDockHelper.prototype.bottom = function (node, height, z) {
    if (height instanceof Array) {
        height = height[1];
    }
    if (height === undefined) {
        var size = this._context.resolveSize(node, [
                this._right - this._left,
                this._bottom - this._top
            ]);
        height = size[1];
    }
    this._context.set(node, {
        size: [
            this._right - this._left,
            height
        ],
        origin: [
            0,
            1
        ],
        align: [
            0,
            1
        ],
        translate: [
            this._left,
            -(this._size[1] - this._bottom),
            z === undefined ? this._z : z
        ]
    });
    this._bottom -= height;
    return this;
};
LayoutDockHelper.prototype.right = function (node, width, z) {
    if (width instanceof Array) {
        width = width[0];
    }
    if (node) {
        if (width === undefined) {
            var size = this._context.resolveSize(node, [
                    this._right - this._left,
                    this._bottom - this._top
                ]);
            width = size[0];
        }
        this._context.set(node, {
            size: [
                width,
                this._bottom - this._top
            ],
            origin: [
                1,
                0
            ],
            align: [
                1,
                0
            ],
            translate: [
                -(this._size[0] - this._right),
                this._top,
                z === undefined ? this._z : z
            ]
        });
    }
    if (width) {
        this._right -= width;
    }
    return this;
};
LayoutDockHelper.prototype.fill = function (node, z) {
    this._context.set(node, {
        size: [
            this._right - this._left,
            this._bottom - this._top
        ],
        translate: [
            this._left,
            this._top,
            z === undefined ? this._z : z
        ]
    });
    return this;
};
LayoutDockHelper.prototype.margins = function (margins) {
    margins = LayoutUtility.normalizeMargins(margins);
    this._left += margins[3];
    this._top += margins[0];
    this._right -= margins[1];
    this._bottom -= margins[2];
    return this;
};
LayoutUtility.registerHelper('dock', LayoutDockHelper);
module.exports = LayoutDockHelper;
},{"../LayoutUtility":8}],12:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var LayoutUtility = require('../LayoutUtility');
var capabilities = {
        sequence: true,
        direction: [
            Utility.Direction.Y,
            Utility.Direction.X
        ],
        scrolling: true,
        trueSize: true,
        sequentialScrollingOptimized: true
    };
var context;
var size;
var direction;
var alignment;
var lineDirection;
var lineLength;
var offset;
var margins;
var margin = [
        0,
        0
    ];
var spacing;
var justify;
var itemSize;
var getItemSize;
var lineNodes;
function _layoutLine(next, endReached) {
    if (!lineNodes.length) {
        return 0;
    }
    var i;
    var lineSize = [
            0,
            0
        ];
    var lineNode;
    for (i = 0; i < lineNodes.length; i++) {
        lineSize[direction] = Math.max(lineSize[direction], lineNodes[i].size[direction]);
        lineSize[lineDirection] += (i > 0 ? spacing[lineDirection] : 0) + lineNodes[i].size[lineDirection];
    }
    var justifyOffset = justify[lineDirection] ? (lineLength - lineSize[lineDirection]) / (lineNodes.length * 2) : 0;
    var lineOffset = (direction ? margins[3] : margins[0]) + justifyOffset;
    var scrollLength;
    for (i = 0; i < lineNodes.length; i++) {
        lineNode = lineNodes[i];
        var translate = [
                0,
                0,
                0
            ];
        translate[lineDirection] = lineOffset;
        translate[direction] = next ? offset : offset - lineSize[direction];
        scrollLength = 0;
        if (i === 0) {
            scrollLength = lineSize[direction];
            if (endReached && (next && !alignment || !next && alignment)) {
                scrollLength += direction ? margins[0] + margins[2] : margins[3] + margins[1];
            } else {
                scrollLength += spacing[direction];
            }
        }
        lineNode.set = {
            size: lineNode.size,
            translate: translate,
            scrollLength: scrollLength
        };
        lineOffset += lineNode.size[lineDirection] + spacing[lineDirection] + justifyOffset * 2;
    }
    for (i = 0; i < lineNodes.length; i++) {
        lineNode = next ? lineNodes[i] : lineNodes[lineNodes.length - 1 - i];
        context.set(lineNode.node, lineNode.set);
    }
    lineNodes = [];
    return lineSize[direction] + spacing[direction];
}
function _resolveNodeSize(node) {
    var localItemSize = itemSize;
    if (getItemSize) {
        localItemSize = getItemSize(node.renderNode, size);
    }
    if (localItemSize[0] === true || localItemSize[1] === true) {
        var result = context.resolveSize(node, size);
        if (localItemSize[0] !== true) {
            result[0] = itemSize[0];
        }
        if (localItemSize[1] !== true) {
            result[1] = itemSize[1];
        }
        return result;
    } else {
        return localItemSize;
    }
}
function CollectionLayout(context_, options) {
    context = context_;
    size = context.size;
    direction = context.direction;
    alignment = context.alignment;
    lineDirection = (direction + 1) % 2;
    if (options.gutter !== undefined && console.warn) {
        console.warn('gutter has been deprecated for CollectionLayout, use margins & spacing instead');
    }
    if (options.gutter && !options.margins && !options.spacing) {
        var gutter = Array.isArray(options.gutter) ? options.gutter : [
                options.gutter,
                options.gutter
            ];
        margins = [
            gutter[1],
            gutter[0],
            gutter[1],
            gutter[0]
        ];
        spacing = gutter;
    } else {
        margins = LayoutUtility.normalizeMargins(options.margins);
        spacing = options.spacing || 0;
        spacing = Array.isArray(spacing) ? spacing : [
            spacing,
            spacing
        ];
    }
    margin[0] = margins[direction ? 0 : 3];
    margin[1] = -margins[direction ? 2 : 1];
    justify = Array.isArray(options.justify) ? options.justify : options.justify ? [
        true,
        true
    ] : [
        false,
        false
    ];
    lineLength = size[lineDirection] - (direction ? margins[3] + margins[1] : margins[0] + margins[2]);
    var node;
    var nodeSize;
    var lineOffset;
    var bound;
    if (!options.itemSize) {
        itemSize = [
            true,
            true
        ];
    } else if (options.itemSize instanceof Function) {
        getItemSize = options.itemSize;
    } else if (options.itemSize[0] === undefined || options.itemSize[0] === undefined) {
        itemSize = [
            options.itemSize[0] === undefined ? size[0] : options.itemSize[0],
            options.itemSize[1] === undefined ? size[1] : options.itemSize[1]
        ];
    } else {
        itemSize = options.itemSize;
    }
    offset = context.scrollOffset + (alignment ? 0 : margin[alignment]);
    bound = context.scrollEnd + (alignment ? 0 : margin[alignment]);
    lineOffset = 0;
    lineNodes = [];
    while (offset < bound) {
        node = context.next();
        if (!node) {
            _layoutLine(true, true);
            break;
        }
        nodeSize = _resolveNodeSize(node);
        lineOffset += (lineNodes.length ? spacing[lineDirection] : 0) + nodeSize[lineDirection];
        if (lineOffset > lineLength) {
            offset += _layoutLine(true, !node);
            lineOffset = nodeSize[lineDirection];
        }
        lineNodes.push({
            node: node,
            size: nodeSize
        });
    }
    offset = context.scrollOffset + (alignment ? margin[alignment] : 0);
    bound = context.scrollStart + (alignment ? margin[alignment] : 0);
    lineOffset = 0;
    lineNodes = [];
    while (offset > bound) {
        node = context.prev();
        if (!node) {
            _layoutLine(false, true);
            break;
        }
        nodeSize = _resolveNodeSize(node);
        lineOffset += (lineNodes.length ? spacing[lineDirection] : 0) + nodeSize[lineDirection];
        if (lineOffset > lineLength) {
            offset -= _layoutLine(false, !node);
            lineOffset = nodeSize[lineDirection];
        }
        lineNodes.unshift({
            node: node,
            size: nodeSize
        });
    }
}
CollectionLayout.Capabilities = capabilities;
CollectionLayout.Name = 'CollectionLayout';
CollectionLayout.Description = 'Multi-cell collection-layout with margins & spacing';
module.exports = CollectionLayout;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../LayoutUtility":8}],13:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var capabilities = {
        sequence: true,
        direction: [
            Utility.Direction.X,
            Utility.Direction.Y
        ],
        scrolling: true
    };
function CoverLayout(context, options) {
    var node = context.next();
    if (!node) {
        return;
    }
    var size = context.size;
    var direction = context.direction;
    var itemSize = options.itemSize;
    var opacityStep = 0.2;
    var scaleStep = 0.1;
    var translateStep = 30;
    var zStart = 100;
    context.set(node, {
        size: itemSize,
        origin: [
            0.5,
            0.5
        ],
        align: [
            0.5,
            0.5
        ],
        translate: [
            0,
            0,
            zStart
        ],
        scrollLength: itemSize[direction]
    });
    var translate = itemSize[0] / 2;
    var opacity = 1 - opacityStep;
    var zIndex = zStart - 1;
    var scale = 1 - scaleStep;
    var prev = false;
    var endReached = false;
    node = context.next();
    if (!node) {
        node = context.prev();
        prev = true;
    }
    while (node) {
        context.set(node, {
            size: itemSize,
            origin: [
                0.5,
                0.5
            ],
            align: [
                0.5,
                0.5
            ],
            translate: direction ? [
                0,
                prev ? -translate : translate,
                zIndex
            ] : [
                prev ? -translate : translate,
                0,
                zIndex
            ],
            scale: [
                scale,
                scale,
                1
            ],
            opacity: opacity,
            scrollLength: itemSize[direction]
        });
        opacity -= opacityStep;
        scale -= scaleStep;
        translate += translateStep;
        zIndex--;
        if (translate >= size[direction] / 2) {
            endReached = true;
        } else {
            node = prev ? context.prev() : context.next();
            endReached = !node;
        }
        if (endReached) {
            if (prev) {
                break;
            }
            endReached = false;
            prev = true;
            node = context.prev();
            if (node) {
                translate = itemSize[direction] / 2;
                opacity = 1 - opacityStep;
                zIndex = zStart - 1;
                scale = 1 - scaleStep;
            }
        }
    }
}
CoverLayout.Capabilities = capabilities;
module.exports = CoverLayout;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],14:[function(require,module,exports){
module.exports = function CubeLayout(context, options) {
    var itemSize = options.itemSize;
    context.set(context.next(), {
        size: itemSize,
        origin: [
            0.5,
            0.5
        ],
        rotate: [
            0,
            Math.PI / 2,
            0
        ],
        translate: [
            itemSize[0] / 2,
            0,
            0
        ]
    });
    context.set(context.next(), {
        size: itemSize,
        origin: [
            0.5,
            0.5
        ],
        rotate: [
            0,
            Math.PI / 2,
            0
        ],
        translate: [
            -(itemSize[0] / 2),
            0,
            0
        ]
    });
    context.set(context.next(), {
        size: itemSize,
        origin: [
            0.5,
            0.5
        ],
        rotate: [
            Math.PI / 2,
            0,
            0
        ],
        translate: [
            0,
            -(itemSize[1] / 2),
            0
        ]
    });
    context.set(context.next(), {
        size: itemSize,
        origin: [
            0.5,
            0.5
        ],
        rotate: [
            Math.PI / 2,
            0,
            0
        ],
        translate: [
            0,
            itemSize[1] / 2,
            0
        ]
    });
};
},{}],15:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var LayoutUtility = require('../LayoutUtility');
var capabilities = {
        sequence: true,
        direction: [
            Utility.Direction.Y,
            Utility.Direction.X
        ],
        scrolling: false
    };
function GridLayout(context, options) {
    var revDirection = context.direction ? 0 : 1;
    if (options.gutter !== undefined && console.warn) {
        console.warn('gutter has been deprecated for GridLayout, use margins & spacing instead');
    }
    var spacing;
    if (options.gutter && !options.spacing) {
        spacing = options.gutter || 0;
    } else {
        spacing = options.spacing || 0;
    }
    spacing = Array.isArray(spacing) ? spacing : [
        spacing,
        spacing
    ];
    var margins = LayoutUtility.normalizeMargins(options.margins);
    var nodeSize = [
            (context.size[0] - ((options.cells[0] - 1) * spacing[0] + margins[1] + margins[3])) / options.cells[0],
            (context.size[1] - ((options.cells[1] - 1) * spacing[1] + margins[0] + margins[2])) / options.cells[1]
        ];
    for (var a = 0; a < options.cells[revDirection]; a++) {
        for (var b = 0; b < options.cells[context.direction]; b++) {
            var node = context.alignment ? context.prev() : context.next();
            if (!node) {
                return;
            }
            context.set(node, {
                size: nodeSize,
                translate: [
                    (nodeSize[0] + spacing[0]) * (revDirection ? b : a) + margins[3],
                    (nodeSize[1] + spacing[1]) * (revDirection ? a : b) + margins[0],
                    0
                ]
            });
        }
    }
}
GridLayout.Capabilities = capabilities;
module.exports = GridLayout;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../LayoutUtility":8}],16:[function(require,module,exports){
var LayoutDockHelper = require('../helpers/LayoutDockHelper');
module.exports = function HeaderFooterLayout(context, options) {
    var dock = new LayoutDockHelper(context, options);
    dock.top('header', options.headerSize || options.headerHeight);
    dock.bottom('footer', options.footerSize || options.footerHeight);
    dock.fill('content');
};
},{"../helpers/LayoutDockHelper":11}],17:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var LayoutUtility = require('../LayoutUtility');
var capabilities = {
        sequence: true,
        direction: [
            Utility.Direction.Y,
            Utility.Direction.X
        ],
        scrolling: true,
        trueSize: true,
        sequentialScrollingOptimized: true
    };
var set = {
        size: [
            0,
            0
        ],
        translate: [
            0,
            0,
            0
        ],
        scrollLength: undefined
    };
var margin = [
        0,
        0
    ];
function ListLayout(context, options) {
    var size = context.size;
    var direction = context.direction;
    var alignment = context.alignment;
    var revDirection = direction ? 0 : 1;
    var offset;
    var margins = LayoutUtility.normalizeMargins(options.margins);
    var spacing = options.spacing || 0;
    var node;
    var nodeSize;
    var itemSize;
    var getItemSize;
    var lastSectionBeforeVisibleCell;
    var lastSectionBeforeVisibleCellOffset;
    var lastSectionBeforeVisibleCellLength;
    var lastSectionBeforeVisibleCellScrollLength;
    var firstVisibleCell;
    var lastNode;
    var lastCellOffsetInFirstVisibleSection;
    var isSectionCallback = options.isSectionCallback;
    var bound;
    set.size[0] = size[0];
    set.size[1] = size[1];
    set.size[revDirection] -= margins[1 - revDirection] + margins[3 - revDirection];
    set.translate[0] = 0;
    set.translate[1] = 0;
    set.translate[2] = 0;
    set.translate[revDirection] = margins[direction ? 3 : 0];
    if (options.itemSize === true || !options.hasOwnProperty('itemSize')) {
        itemSize = true;
    } else if (options.itemSize instanceof Function) {
        getItemSize = options.itemSize;
    } else {
        itemSize = options.itemSize === undefined ? size[direction] : options.itemSize;
    }
    margin[0] = margins[direction ? 0 : 3];
    margin[1] = -margins[direction ? 2 : 1];
    offset = context.scrollOffset + margin[alignment];
    bound = context.scrollEnd + margin[alignment];
    while (offset < bound) {
        lastNode = node;
        node = context.next();
        if (!node) {
            if (lastNode && !alignment) {
                set.scrollLength = nodeSize + margin[0] + -margin[1];
                context.set(lastNode, set);
            }
            break;
        }
        nodeSize = getItemSize ? getItemSize(node.renderNode) : itemSize;
        nodeSize = nodeSize === true ? context.resolveSize(node, size)[direction] : nodeSize;
        set.size[direction] = nodeSize;
        set.translate[direction] = offset + (alignment ? spacing : 0);
        set.scrollLength = nodeSize + spacing;
        context.set(node, set);
        offset += set.scrollLength;
        if (isSectionCallback && isSectionCallback(node.renderNode)) {
            set.translate[direction] = Math.max(margin[0], set.translate[direction]);
            context.set(node, set);
            if (!firstVisibleCell) {
                lastSectionBeforeVisibleCell = node;
                lastSectionBeforeVisibleCellOffset = offset - nodeSize;
                lastSectionBeforeVisibleCellLength = nodeSize;
                lastSectionBeforeVisibleCellScrollLength = nodeSize;
            } else if (lastCellOffsetInFirstVisibleSection === undefined) {
                lastCellOffsetInFirstVisibleSection = offset - nodeSize;
            }
        } else if (!firstVisibleCell && offset >= 0) {
            firstVisibleCell = node;
        }
    }
    node = undefined;
    offset = context.scrollOffset + margin[alignment];
    bound = context.scrollStart + margin[alignment];
    while (offset > bound) {
        lastNode = node;
        node = context.prev();
        if (!node) {
            if (lastNode && alignment) {
                set.scrollLength = nodeSize + margin[0] + -margin[1];
                context.set(lastNode, set);
                if (lastSectionBeforeVisibleCell === lastNode) {
                    lastSectionBeforeVisibleCellScrollLength = set.scrollLength;
                }
            }
            break;
        }
        nodeSize = getItemSize ? getItemSize(node.renderNode) : itemSize;
        nodeSize = nodeSize === true ? context.resolveSize(node, size)[direction] : nodeSize;
        set.scrollLength = nodeSize + spacing;
        offset -= set.scrollLength;
        set.size[direction] = nodeSize;
        set.translate[direction] = offset + (alignment ? spacing : 0);
        context.set(node, set);
        if (isSectionCallback && isSectionCallback(node.renderNode)) {
            set.translate[direction] = Math.max(margin[0], set.translate[direction]);
            context.set(node, set);
            if (!lastSectionBeforeVisibleCell) {
                lastSectionBeforeVisibleCell = node;
                lastSectionBeforeVisibleCellOffset = offset;
                lastSectionBeforeVisibleCellLength = nodeSize;
                lastSectionBeforeVisibleCellScrollLength = set.scrollLength;
            }
        } else if (offset + nodeSize >= 0) {
            firstVisibleCell = node;
            if (lastSectionBeforeVisibleCell) {
                lastCellOffsetInFirstVisibleSection = offset + nodeSize;
            }
            lastSectionBeforeVisibleCell = undefined;
        }
    }
    if (isSectionCallback && !lastSectionBeforeVisibleCell) {
        node = context.prev();
        while (node) {
            if (isSectionCallback(node.renderNode)) {
                lastSectionBeforeVisibleCell = node;
                nodeSize = options.itemSize || context.resolveSize(node, size)[direction];
                lastSectionBeforeVisibleCellOffset = offset - nodeSize;
                lastSectionBeforeVisibleCellLength = nodeSize;
                lastSectionBeforeVisibleCellScrollLength = undefined;
                break;
            } else {
                node = context.prev();
            }
        }
    }
    if (lastSectionBeforeVisibleCell) {
        var correctedOffset = Math.max(margin[0], lastSectionBeforeVisibleCellOffset);
        if (lastCellOffsetInFirstVisibleSection !== undefined && lastSectionBeforeVisibleCellLength > lastCellOffsetInFirstVisibleSection - margin[0]) {
            correctedOffset = lastCellOffsetInFirstVisibleSection - lastSectionBeforeVisibleCellLength;
        }
        set.size[direction] = lastSectionBeforeVisibleCellLength;
        set.translate[direction] = correctedOffset;
        set.scrollLength = lastSectionBeforeVisibleCellScrollLength;
        context.set(lastSectionBeforeVisibleCell, set);
    }
}
ListLayout.Capabilities = capabilities;
ListLayout.Name = 'ListLayout';
ListLayout.Description = 'List-layout with margins, spacing and sticky headers';
module.exports = ListLayout;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../LayoutUtility":8}],18:[function(require,module,exports){
var LayoutDockHelper = require('../helpers/LayoutDockHelper');
module.exports = function NavBarLayout(context, options) {
    var dock = new LayoutDockHelper(context, {
            margins: options.margins,
            translateZ: 1
        });
    context.set('background', { size: context.size });
    var node;
    var i;
    var rightItems = context.get('rightItems');
    if (rightItems) {
        for (i = 0; i < rightItems.length; i++) {
            node = context.get(rightItems[i]);
            dock.right(node, options.rightItemWidth || options.itemWidth);
            dock.right(undefined, options.rightItemSpacer || options.itemSpacer);
        }
    }
    var leftItems = context.get('leftItems');
    if (leftItems) {
        for (i = 0; i < leftItems.length; i++) {
            node = context.get(leftItems[i]);
            dock.left(node, options.leftItemWidth || options.itemWidth);
            dock.left(undefined, options.leftItemSpacer || options.itemSpacer);
        }
    }
    dock.fill('title');
};
},{"../helpers/LayoutDockHelper":11}],19:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var capabilities = {
        sequence: true,
        direction: [
            Utility.Direction.Y,
            Utility.Direction.X
        ],
        scrolling: false
    };
var direction;
var size;
var ratios;
var total;
var offset;
var index;
var node;
var set = {
        size: [
            0,
            0
        ],
        translate: [
            0,
            0,
            0
        ]
    };
function ProportionalLayout(context, options) {
    size = context.size;
    direction = context.direction;
    ratios = options.ratios;
    total = 0;
    for (index = 0; index < ratios.length; index++) {
        total += ratios[index];
    }
    set.size[0] = size[0];
    set.size[1] = size[1];
    set.translate[0] = 0;
    set.translate[1] = 0;
    node = context.next();
    offset = 0;
    index = 0;
    while (node && index < ratios.length) {
        set.size[direction] = (size[direction] - offset) / total * ratios[index];
        set.translate[direction] = offset;
        context.set(node, set);
        offset += set.size[direction];
        total -= ratios[index];
        index++;
        node = context.next();
    }
}
ProportionalLayout.Capabilities = capabilities;
module.exports = ProportionalLayout;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],20:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var LayoutUtility = require('../LayoutUtility');
var capabilities = {
        sequence: true,
        direction: [
            Utility.Direction.X,
            Utility.Direction.Y
        ],
        trueSize: true
    };
var size;
var direction;
var revDirection;
var items;
var spacers;
var margins;
var spacing;
var sizeLeft;
var set = {
        size: [
            0,
            0
        ],
        translate: [
            0,
            0,
            0
        ],
        align: [
            0,
            0
        ],
        origin: [
            0,
            0
        ]
    };
var nodeSize;
var offset;
function NavBarLayout(context, options) {
    size = context.size;
    direction = context.direction;
    revDirection = direction ? 0 : 1;
    spacing = options.spacing || 0;
    items = context.get('items');
    spacers = context.get('spacers');
    margins = LayoutUtility.normalizeMargins(options.margins);
    set.size[0] = context.size[0];
    set.size[1] = context.size[1];
    set.size[revDirection] -= margins[1 - revDirection] + margins[3 - revDirection];
    set.translate[0] = 0;
    set.translate[1] = 0;
    set.translate[2] = 0.001;
    set.translate[revDirection] = margins[direction ? 3 : 0];
    set.align[0] = 0;
    set.align[1] = 0;
    set.origin[0] = 0;
    set.origin[1] = 0;
    offset = direction ? margins[0] : margins[3];
    sizeLeft = size[direction] - (offset + (direction ? margins[2] : margins[1]));
    sizeLeft -= (items.length - 1) * spacing;
    for (var i = 0; i < items.length; i++) {
        if (options.itemSize === undefined) {
            nodeSize = Math.round(sizeLeft / (items.length - i));
        } else {
            nodeSize = options.itemSize === true ? context.resolveSize(items[i], size)[direction] : options.itemSize;
        }
        set.scrollLength = nodeSize;
        if (i === 0) {
            set.scrollLength += direction ? margins[0] : margins[3];
        }
        if (i === items.length - 1) {
            set.scrollLength += direction ? margins[2] : margins[1];
        } else {
            set.scrollLength += spacing;
        }
        set.size[direction] = nodeSize;
        set.translate[direction] = offset;
        context.set(items[i], set);
        offset += nodeSize;
        sizeLeft -= nodeSize;
        if (i === options.selectedItemIndex) {
            set.scrollLength = 0;
            set.translate[direction] += nodeSize / 2;
            set.translate[2] = 0.002;
            set.origin[direction] = 0.5;
            context.set('selectedItemOverlay', set);
            set.origin[direction] = 0;
            set.translate[2] = 0.001;
        }
        if (i < items.length - 1) {
            if (spacers && i < spacers.length) {
                set.size[direction] = spacing;
                set.translate[direction] = offset;
                context.set(spacers[i], set);
            }
            offset += spacing;
        } else {
            offset += direction ? margins[2] : margins[1];
        }
    }
    set.scrollLength = 0;
    set.size[direction] = size[direction];
    set.translate[direction] = 0;
    set.translate[2] = 0;
    context.set('background', set);
}
NavBarLayout.Capabilities = capabilities;
NavBarLayout.Name = 'TabBarLayout';
NavBarLayout.Description = 'TabBar widget layout';
module.exports = NavBarLayout;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../LayoutUtility":8}],21:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var capabilities = {
        sequence: true,
        direction: [
            Utility.Direction.Y,
            Utility.Direction.X
        ],
        scrolling: true,
        trueSize: true
    };
var size;
var direction;
var revDirection;
var node;
var itemSize;
var diameter;
var offset;
var bound;
var angle;
var radius;
var itemAngle;
var radialOpacity;
var set = {
        opacity: 1,
        size: [
            0,
            0
        ],
        translate: [
            0,
            0,
            0
        ],
        rotate: [
            0,
            0,
            0
        ],
        origin: [
            0.5,
            0.5
        ],
        align: [
            0.5,
            0.5
        ],
        scrollLength: undefined
    };
function WheelLayout(context, options) {
    size = context.size;
    direction = context.direction;
    revDirection = direction ? 0 : 1;
    itemSize = options.itemSize || size[direction] / 2;
    diameter = options.diameter || itemSize * 3;
    radius = diameter / 2;
    itemAngle = Math.atan2(itemSize / 2, radius) * 2;
    radialOpacity = options.radialOpacity === undefined ? 1 : options.radialOpacity;
    set.opacity = 1;
    set.size[0] = size[0];
    set.size[1] = size[1];
    set.size[revDirection] = size[revDirection];
    set.size[direction] = itemSize;
    set.translate[0] = 0;
    set.translate[1] = 0;
    set.translate[2] = 0;
    set.rotate[0] = 0;
    set.rotate[1] = 0;
    set.rotate[2] = 0;
    set.scrollLength = itemSize;
    offset = context.scrollOffset;
    bound = Math.PI / 2 / itemAngle * itemSize + itemSize;
    while (offset <= bound) {
        node = context.next();
        if (!node) {
            break;
        }
        if (offset >= -bound) {
            angle = offset / itemSize * itemAngle;
            set.translate[direction] = radius * Math.sin(angle);
            set.translate[2] = radius * Math.cos(angle) - radius;
            set.rotate[revDirection] = direction ? -angle : angle;
            set.opacity = 1 - Math.abs(angle) / (Math.PI / 2) * (1 - radialOpacity);
            context.set(node, set);
        }
        offset += itemSize;
    }
    offset = context.scrollOffset - itemSize;
    while (offset >= -bound) {
        node = context.prev();
        if (!node) {
            break;
        }
        if (offset <= bound) {
            angle = offset / itemSize * itemAngle;
            set.translate[direction] = radius * Math.sin(angle);
            set.translate[2] = radius * Math.cos(angle) - radius;
            set.rotate[revDirection] = direction ? -angle : angle;
            set.opacity = 1 - Math.abs(angle) / (Math.PI / 2) * (1 - radialOpacity);
            context.set(node, set);
        }
        offset -= itemSize;
    }
}
WheelLayout.Capabilities = capabilities;
WheelLayout.Name = 'WheelLayout';
WheelLayout.Description = 'Spinner-wheel/slot-machine layout';
module.exports = WheelLayout;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],22:[function(require,module,exports){
(function (global){
var View = typeof window !== 'undefined' ? window.famous.core.View : typeof global !== 'undefined' ? global.famous.core.View : null;
var Surface = typeof window !== 'undefined' ? window.famous.core.Surface : typeof global !== 'undefined' ? global.famous.core.Surface : null;
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var ContainerSurface = typeof window !== 'undefined' ? window.famous.surfaces.ContainerSurface : typeof global !== 'undefined' ? global.famous.surfaces.ContainerSurface : null;
var LayoutController = require('../LayoutController');
var ScrollController = require('../ScrollController');
var WheelLayout = require('../layouts/WheelLayout');
var ProportionalLayout = require('../layouts/ProportionalLayout');
var VirtualViewSequence = require('../VirtualViewSequence');
var DatePickerComponents = require('./DatePickerComponents');
var LayoutUtility = require('../LayoutUtility');
function DatePicker(options) {
    View.apply(this, arguments);
    options = options || {};
    this._date = new Date(options.date ? options.date.getTime() : undefined);
    this._components = [];
    this.classes = options.classes ? this.classes.concat(options.classes) : this.classes;
    _createLayout.call(this);
    _updateComponents.call(this);
    this._overlayRenderables = {
        top: this.options.renderables.top ? _createRenderable.call(this, 'top') : undefined,
        middle: this.options.renderables.middle ? _createRenderable.call(this, 'middle') : undefined,
        bottom: this.options.renderables.bottom ? _createRenderable.call(this, 'bottom') : undefined
    };
    _createOverlay.call(this);
    this.setOptions(this.options);
}
DatePicker.prototype = Object.create(View.prototype);
DatePicker.prototype.constructor = DatePicker;
DatePicker.prototype.classes = [
    'ff-widget',
    'ff-datepicker'
];
DatePicker.Component = DatePickerComponents;
DatePicker.DEFAULT_OPTIONS = {
    perspective: 500,
    wheelLayout: {
        itemSize: 100,
        diameter: 500
    },
    renderables: {
        background: false,
        top: false,
        middle: false,
        bottom: false
    },
    scrollController: {
        enabled: true,
        paginated: true,
        paginationMode: ScrollController.PaginationMode.SCROLL,
        mouseMove: true,
        scrollSpring: {
            dampingRatio: 1,
            period: 800
        }
    }
};
function _createRenderable(id, data) {
    if (this.options.createRenderable) {
        var renderable = this.options.createRenderable.call(this, id, data);
        if (renderable) {
            return renderable;
        }
    }
    if (data !== undefined && data instanceof Object) {
        return data;
    }
    var surface = new Surface({
            classes: this.classes,
            content: data ? '<div>' + data + '</div>' : undefined
        });
    if (Array.isArray(id)) {
        for (var i = 0; i < id.length; i++) {
            surface.addClass(id[i]);
        }
    } else {
        surface.addClass(id);
    }
    return surface;
}
DatePicker.prototype.setOptions = function (options) {
    View.prototype.setOptions.call(this, options);
    if (!this.layout) {
        return this;
    }
    if (options.perspective !== undefined) {
        this.container.context.setPerspective(options.perspective);
    }
    var i;
    if (options.wheelLayout !== undefined) {
        for (i = 0; i < this.scrollWheels.length; i++) {
            this.scrollWheels[i].scrollController.setLayoutOptions(options.wheelLayout);
        }
        this.overlay.setLayoutOptions({ itemSize: this.options.wheelLayout.itemSize });
    }
    if (options.scrollController !== undefined) {
        for (i = 0; i < this.scrollWheels.length; i++) {
            this.scrollWheels[i].scrollController.setOptions(options.scrollController);
        }
    }
    return this;
};
DatePicker.prototype.setComponents = function (components) {
    this._components = components;
    _updateComponents.call(this);
    return this;
};
DatePicker.prototype.getComponents = function () {
    return this._components;
};
DatePicker.prototype.setDate = function (date) {
    this._date.setTime(date.getTime());
    _setDateToScrollWheels.call(this, this._date);
    return this;
};
DatePicker.prototype.getDate = function () {
    return this._date;
};
function _setDateToScrollWheels(date) {
    for (var i = 0; i < this.scrollWheels.length; i++) {
        var scrollWheel = this.scrollWheels[i];
        var component = scrollWheel.component;
        var item = scrollWheel.scrollController.getFirstVisibleItem();
        if (item && item.viewSequence) {
            var viewSequence = item.viewSequence;
            var renderNode = item.viewSequence.get();
            var currentValue = component.getComponent(renderNode.date);
            var destValue = component.getComponent(date);
            var steps = 0;
            if (currentValue !== destValue) {
                steps = destValue - currentValue;
                if (component.loop) {
                    var revSteps = steps < 0 ? steps + component.upperBound : steps - component.upperBound;
                    if (Math.abs(revSteps) < Math.abs(steps)) {
                        steps = revSteps;
                    }
                }
            }
            if (!steps) {
                scrollWheel.scrollController.goToRenderNode(renderNode);
            } else {
                while (currentValue !== destValue) {
                    viewSequence = steps > 0 ? viewSequence.getNext() : viewSequence.getPrevious();
                    renderNode = viewSequence ? viewSequence.get() : undefined;
                    if (!renderNode) {
                        break;
                    }
                    currentValue = component.getComponent(renderNode.date);
                    if (steps > 0) {
                        scrollWheel.scrollController.goToNextPage();
                    } else {
                        scrollWheel.scrollController.goToPreviousPage();
                    }
                }
            }
        }
    }
}
function _getDateFromScrollWheels() {
    var date = new Date(this._date);
    for (var i = 0; i < this.scrollWheels.length; i++) {
        var scrollWheel = this.scrollWheels[i];
        var component = scrollWheel.component;
        var item = scrollWheel.scrollController.getFirstVisibleItem();
        if (item && item.renderNode) {
            component.setComponent(date, component.getComponent(item.renderNode.date));
        }
    }
    return date;
}
function _createLayout() {
    this.container = new ContainerSurface(this.options.container);
    this.container.setClasses(this.classes);
    this.layout = new LayoutController({
        layout: ProportionalLayout,
        layoutOptions: { ratios: [] },
        direction: Utility.Direction.X
    });
    this.container.add(this.layout);
    this.add(this.container);
}
function _clickItem(scrollWheel, event) {
    if (scrollWheel && event && event.target) {
    }
}
function _scrollWheelScrollStart() {
    this._scrollingCount++;
    if (this._scrollingCount === 1) {
        this._eventOutput.emit('scrollstart', { target: this });
    }
}
function _scrollWheelScrollEnd() {
    this._scrollingCount--;
    if (this._scrollingCount === 0) {
        this._eventOutput.emit('scrollend', {
            target: this,
            date: this._date
        });
    }
}
function _scrollWheelPageChange() {
    this._date = _getDateFromScrollWheels.call(this);
    this._eventOutput.emit('datechange', {
        target: this,
        date: this._date
    });
}
function _updateComponents() {
    this.scrollWheels = [];
    this._scrollingCount = 0;
    var dataSource = [];
    var sizeRatios = [];
    for (var i = 0; i < this._components.length; i++) {
        var component = this._components[i];
        component.createRenderable = _createRenderable.bind(this);
        var viewSequence = new VirtualViewSequence({
                factory: component,
                value: component.create(this._date)
            });
        var options = LayoutUtility.combineOptions(this.options.scrollController, {
                layout: WheelLayout,
                layoutOptions: this.options.wheelLayout,
                flow: false,
                direction: Utility.Direction.Y,
                dataSource: viewSequence,
                autoPipeEvents: true
            });
        var scrollController = new ScrollController(options);
        scrollController.on('scrollstart', _scrollWheelScrollStart.bind(this));
        scrollController.on('scrollend', _scrollWheelScrollEnd.bind(this));
        scrollController.on('pagechange', _scrollWheelPageChange.bind(this));
        var scrollWheel = {
                component: component,
                scrollController: scrollController,
                viewSequence: viewSequence
            };
        this.scrollWheels.push(scrollWheel);
        component.on('click', _clickItem.bind(this, scrollWheel));
        dataSource.push(scrollController);
        sizeRatios.push(component.sizeRatio);
    }
    this.layout.setDataSource(dataSource);
    this.layout.setLayoutOptions({ ratios: sizeRatios });
}
function OverlayLayout(context, options) {
    var height = (context.size[1] - options.itemSize) / 2;
    context.set('top', {
        size: [
            context.size[0],
            height
        ],
        translate: [
            0,
            0,
            1
        ]
    });
    context.set('middle', {
        size: [
            context.size[0],
            context.size[1] - height * 2
        ],
        translate: [
            0,
            height,
            1
        ]
    });
    context.set('bottom', {
        size: [
            context.size[0],
            height
        ],
        translate: [
            0,
            context.size[1] - height,
            1
        ]
    });
}
function _createOverlay() {
    this.overlay = new LayoutController({
        layout: OverlayLayout,
        layoutOptions: { itemSize: this.options.wheelLayout.itemSize },
        dataSource: this._overlayRenderables
    });
    this.add(this.overlay);
}
module.exports = DatePicker;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../LayoutController":5,"../LayoutUtility":8,"../ScrollController":9,"../VirtualViewSequence":10,"../layouts/ProportionalLayout":19,"../layouts/WheelLayout":21,"./DatePickerComponents":23}],23:[function(require,module,exports){
(function (global){
var Surface = typeof window !== 'undefined' ? window.famous.core.Surface : typeof global !== 'undefined' ? global.famous.core.Surface : null;
var EventHandler = typeof window !== 'undefined' ? window.famous.core.EventHandler : typeof global !== 'undefined' ? global.famous.core.EventHandler : null;
function decimal1(date) {
    return '' + date[this.get]();
}
function decimal2(date) {
    return ('0' + date[this.get]()).slice(-2);
}
function decimal3(date) {
    return ('00' + date[this.get]()).slice(-3);
}
function decimal4(date) {
    return ('000' + date[this.get]()).slice(-4);
}
function Base(options) {
    this._eventOutput = new EventHandler();
    this._pool = [];
    EventHandler.setOutputHandler(this, this._eventOutput);
    if (options) {
        for (var key in options) {
            this[key] = options[key];
        }
    }
}
Base.prototype.step = 1;
Base.prototype.classes = ['item'];
Base.prototype.getComponent = function (date) {
    return date[this.get]();
};
Base.prototype.setComponent = function (date, value) {
    return date[this.set](value);
};
Base.prototype.format = function (date) {
    return 'overide to implement';
};
Base.prototype.createNext = function (renderable) {
    var date = this.getNext(renderable.date);
    return date ? this.create(date) : undefined;
};
Base.prototype.getNext = function (date) {
    date = new Date(date.getTime());
    var newVal = this.getComponent(date) + this.step;
    if (this.upperBound !== undefined && newVal >= this.upperBound) {
        if (!this.loop) {
            return undefined;
        }
        newVal = Math.max(newVal % this.upperBound, this.lowerBound || 0);
    }
    this.setComponent(date, newVal);
    return date;
};
Base.prototype.createPrevious = function (renderable) {
    var date = this.getPrevious(renderable.date);
    return date ? this.create(date) : undefined;
};
Base.prototype.getPrevious = function (date) {
    date = new Date(date.getTime());
    var newVal = this.getComponent(date) - this.step;
    if (this.lowerBound !== undefined && newVal < this.lowerBound) {
        if (!this.loop) {
            return undefined;
        }
        newVal = newVal % this.upperBound;
    }
    this.setComponent(date, newVal);
    return date;
};
Base.prototype.installClickHandler = function (renderable) {
    renderable.on('click', function (event) {
        this._eventOutput.emit('click', {
            target: renderable,
            event: event
        });
    }.bind(this));
};
Base.prototype.createRenderable = function (classes, data) {
    return new Surface({
        classes: classes,
        content: '<div>' + data + '</div>'
    });
};
Base.prototype.create = function (date) {
    date = date || new Date();
    var renderable;
    if (this._pool.length) {
        renderable = this._pool[0];
        this._pool.splice(0, 1);
        renderable.setContent(this.format(date));
    } else {
        renderable = this.createRenderable(this.classes, this.format(date));
        this.installClickHandler(renderable);
    }
    renderable.date = date;
    return renderable;
};
Base.prototype.destroy = function (renderable) {
    this._pool.push(renderable);
};
function Year() {
    Base.apply(this, arguments);
}
Year.prototype = Object.create(Base.prototype);
Year.prototype.constructor = Year;
Year.prototype.classes = [
    'item',
    'year'
];
Year.prototype.format = decimal4;
Year.prototype.sizeRatio = 1;
Year.prototype.step = 1;
Year.prototype.loop = false;
Year.prototype.set = 'setFullYear';
Year.prototype.get = 'getFullYear';
function Month() {
    Base.apply(this, arguments);
}
Month.prototype = Object.create(Base.prototype);
Month.prototype.constructor = Month;
Month.prototype.classes = [
    'item',
    'month'
];
Month.prototype.sizeRatio = 2;
Month.prototype.lowerBound = 0;
Month.prototype.upperBound = 12;
Month.prototype.step = 1;
Month.prototype.loop = true;
Month.prototype.set = 'setMonth';
Month.prototype.get = 'getMonth';
Month.prototype.strings = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];
Month.prototype.format = function (date) {
    return this.strings[date.getMonth()];
};
function FullDay() {
    Base.apply(this, arguments);
}
FullDay.prototype = Object.create(Base.prototype);
FullDay.prototype.constructor = FullDay;
FullDay.prototype.classes = [
    'item',
    'fullday'
];
FullDay.prototype.sizeRatio = 2;
FullDay.prototype.step = 1;
FullDay.prototype.set = 'setDate';
FullDay.prototype.get = 'getDate';
FullDay.prototype.format = function (date) {
    return date.toLocaleDateString();
};
function WeekDay() {
    Base.apply(this, arguments);
}
WeekDay.prototype = Object.create(Base.prototype);
WeekDay.prototype.constructor = WeekDay;
WeekDay.prototype.classes = [
    'item',
    'weekday'
];
WeekDay.prototype.sizeRatio = 2;
WeekDay.prototype.lowerBound = 0;
WeekDay.prototype.upperBound = 7;
WeekDay.prototype.step = 1;
WeekDay.prototype.loop = true;
WeekDay.prototype.set = 'setDate';
WeekDay.prototype.get = 'getDate';
WeekDay.prototype.strings = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];
WeekDay.prototype.format = function (date) {
    return this.strings[date.getDay()];
};
function Day() {
    Base.apply(this, arguments);
}
Day.prototype = Object.create(Base.prototype);
Day.prototype.constructor = Day;
Day.prototype.classes = [
    'item',
    'day'
];
Day.prototype.format = decimal1;
Day.prototype.sizeRatio = 1;
Day.prototype.lowerBound = 1;
Day.prototype.upperBound = 32;
Day.prototype.step = 1;
Day.prototype.loop = true;
Day.prototype.set = 'setDate';
Day.prototype.get = 'getDate';
function Hour() {
    Base.apply(this, arguments);
}
Hour.prototype = Object.create(Base.prototype);
Hour.prototype.constructor = Hour;
Hour.prototype.classes = [
    'item',
    'hour'
];
Hour.prototype.format = decimal2;
Hour.prototype.sizeRatio = 1;
Hour.prototype.lowerBound = 0;
Hour.prototype.upperBound = 24;
Hour.prototype.step = 1;
Hour.prototype.loop = true;
Hour.prototype.set = 'setHours';
Hour.prototype.get = 'getHours';
function Minute() {
    Base.apply(this, arguments);
}
Minute.prototype = Object.create(Base.prototype);
Minute.prototype.constructor = Minute;
Minute.prototype.classes = [
    'item',
    'minute'
];
Minute.prototype.format = decimal2;
Minute.prototype.sizeRatio = 1;
Minute.prototype.lowerBound = 0;
Minute.prototype.upperBound = 60;
Minute.prototype.step = 1;
Minute.prototype.loop = true;
Minute.prototype.set = 'setMinutes';
Minute.prototype.get = 'getMinutes';
function Second() {
    Base.apply(this, arguments);
}
Second.prototype = Object.create(Base.prototype);
Second.prototype.constructor = Second;
Second.prototype.classes = [
    'item',
    'second'
];
Second.prototype.format = decimal2;
Second.prototype.sizeRatio = 1;
Second.prototype.lowerBound = 0;
Second.prototype.upperBound = 60;
Second.prototype.step = 1;
Second.prototype.loop = true;
Second.prototype.set = 'setSeconds';
Second.prototype.get = 'getSeconds';
function Millisecond() {
    Base.apply(this, arguments);
}
Millisecond.prototype = Object.create(Base.prototype);
Millisecond.prototype.constructor = Millisecond;
Millisecond.prototype.classes = [
    'item',
    'millisecond'
];
Millisecond.prototype.format = decimal3;
Millisecond.prototype.sizeRatio = 1;
Millisecond.prototype.lowerBound = 0;
Millisecond.prototype.upperBound = 1000;
Millisecond.prototype.step = 1;
Millisecond.prototype.loop = true;
Millisecond.prototype.set = 'setMilliseconds';
Millisecond.prototype.get = 'getMilliseconds';
module.exports = {
    Base: Base,
    Year: Year,
    Month: Month,
    FullDay: FullDay,
    WeekDay: WeekDay,
    Day: Day,
    Hour: Hour,
    Minute: Minute,
    Second: Second,
    Millisecond: Millisecond
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],24:[function(require,module,exports){
(function (global){
var Surface = typeof window !== 'undefined' ? window.famous.core.Surface : typeof global !== 'undefined' ? global.famous.core.Surface : null;
var View = typeof window !== 'undefined' ? window.famous.core.View : typeof global !== 'undefined' ? global.famous.core.View : null;
var LayoutController = require('../LayoutController');
var TabBarLayout = require('../layouts/TabBarLayout');
function TabBar(options) {
    View.apply(this, arguments);
    this._selectedItemIndex = -1;
    options = options || {};
    this.classes = options.classes ? this.classes.concat(options.classes) : this.classes;
    this.layout = new LayoutController(this.options.layoutController);
    this.add(this.layout);
    this.layout.pipe(this._eventOutput);
    this._renderables = {
        items: [],
        spacers: [],
        background: this.options.renderables.background ? _createRenderable.call(this, 'background') : undefined,
        selectedItemOverlay: this.options.renderables.selectedItemOverlay ? _createRenderable.call(this, 'selectedItemOverlay') : undefined
    };
    this.setOptions(this.options);
}
TabBar.prototype = Object.create(View.prototype);
TabBar.prototype.constructor = TabBar;
TabBar.prototype.classes = [
    'ff-widget',
    'ff-tabbar'
];
TabBar.DEFAULT_OPTIONS = {
    tabBarLayout: {
        margins: [
            0,
            0,
            0,
            0
        ],
        spacing: 0
    },
    renderables: {
        background: false,
        selectedItemOverlay: false,
        spacer: false
    },
    layoutController: {
        autoPipeEvents: true,
        layout: TabBarLayout,
        flow: true,
        reflowOnResize: false,
        nodeSpring: {
            dampingRatio: 0.8,
            period: 300
        }
    }
};
function _setSelectedItem(index) {
    if (index !== this._selectedItemIndex) {
        var oldIndex = this._selectedItemIndex;
        this._selectedItemIndex = index;
        this.layout.setLayoutOptions({ selectedItemIndex: index });
        if (oldIndex >= 0 && this._renderables.items[oldIndex].removeClass) {
            this._renderables.items[oldIndex].removeClass('selected');
        }
        if (this._renderables.items[index].addClass) {
            this._renderables.items[index].addClass('selected');
        }
        if (oldIndex >= 0) {
            this._eventOutput.emit('tabchange', {
                target: this,
                index: index,
                oldIndex: oldIndex,
                item: this._renderables.items[index]
            });
        }
    }
}
function _createRenderable(id, data) {
    if (this.options.createRenderable) {
        var renderable = this.options.createRenderable.call(this, id, data);
        if (renderable) {
            return renderable;
        }
    }
    if (data !== undefined && data instanceof Object) {
        return data;
    }
    var surface = new Surface({
            classes: this.classes,
            content: data ? '<div>' + data + '</div>' : undefined
        });
    surface.addClass(id);
    if (id === 'item') {
        if (this.options.tabBarLayout && this.options.tabBarLayout.itemSize && this.options.tabBarLayout.itemSize === true) {
            surface.setSize(this.layout.getDirection() ? [
                undefined,
                true
            ] : [
                true,
                undefined
            ]);
        }
    }
    return surface;
}
TabBar.prototype.setOptions = function (options) {
    View.prototype.setOptions.call(this, options);
    if (!this.layout) {
        return this;
    }
    if (options.tabBarLayout !== undefined) {
        this.layout.setLayoutOptions(options.tabBarLayout);
    }
    if (options.layoutController) {
        this.layout.setOptions(options.layoutController);
    }
    return this;
};
TabBar.prototype.setItems = function (items) {
    var currentIndex = this._selectedItemIndex;
    this._selectedItemIndex = -1;
    this._renderables.items = [];
    this._renderables.spacers = [];
    if (items) {
        for (var i = 0; i < items.length; i++) {
            var item = _createRenderable.call(this, 'item', items[i]);
            if (item.on) {
                item.on('click', _setSelectedItem.bind(this, i));
            }
            this._renderables.items.push(item);
            if (this.options.renderables.spacer && i < items.length - 1) {
                var spacer = _createRenderable.call(this, 'spacer', ' ');
                this._renderables.spacers.push(spacer);
            }
        }
    }
    this.layout.setDataSource(this._renderables);
    if (this._renderables.items.length) {
        _setSelectedItem.call(this, Math.max(Math.min(currentIndex, this._renderables.items.length - 1), 0));
    }
    return this;
};
TabBar.prototype.getItems = function () {
    return this._renderables.items;
};
TabBar.prototype.getItemSpec = function (index, normalize) {
    return this.layout.getSpec(this._renderables.items[index], normalize);
};
TabBar.prototype.setSelectedItemIndex = function (index) {
    _setSelectedItem.call(this, index);
    return this;
};
TabBar.prototype.getSelectedItemIndex = function () {
    return this._selectedItemIndex;
};
TabBar.prototype.getSize = function () {
    return this.options.size || (this.layout ? this.layout.getSize() : View.prototype.getSize.call(this));
};
module.exports = TabBar;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../LayoutController":5,"../layouts/TabBarLayout":20}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJnbG9iYWwtbm8tZmFtb3VzLnRlbXBsYXRlLmpzIiwic3JjL0ZsZXhTY3JvbGxWaWV3LmpzIiwic3JjL0Zsb3dMYXlvdXROb2RlLmpzIiwic3JjL0xheW91dENvbnRleHQuanMiLCJzcmMvTGF5b3V0Q29udHJvbGxlci5qcyIsInNyYy9MYXlvdXROb2RlLmpzIiwic3JjL0xheW91dE5vZGVNYW5hZ2VyLmpzIiwic3JjL0xheW91dFV0aWxpdHkuanMiLCJzcmMvU2Nyb2xsQ29udHJvbGxlci5qcyIsInNyYy9WaXJ0dWFsVmlld1NlcXVlbmNlLmpzIiwic3JjL2hlbHBlcnMvTGF5b3V0RG9ja0hlbHBlci5qcyIsInNyYy9sYXlvdXRzL0NvbGxlY3Rpb25MYXlvdXQuanMiLCJzcmMvbGF5b3V0cy9Db3ZlckxheW91dC5qcyIsInNyYy9sYXlvdXRzL0N1YmVMYXlvdXQuanMiLCJzcmMvbGF5b3V0cy9HcmlkTGF5b3V0LmpzIiwic3JjL2xheW91dHMvSGVhZGVyRm9vdGVyTGF5b3V0LmpzIiwic3JjL2xheW91dHMvTGlzdExheW91dC5qcyIsInNyYy9sYXlvdXRzL05hdkJhckxheW91dC5qcyIsInNyYy9sYXlvdXRzL1Byb3BvcnRpb25hbExheW91dC5qcyIsInNyYy9sYXlvdXRzL1RhYkJhckxheW91dC5qcyIsInNyYy9sYXlvdXRzL1doZWVsTGF5b3V0LmpzIiwic3JjL3dpZGdldHMvRGF0ZVBpY2tlci5qcyIsInNyYy93aWRnZXRzL0RhdGVQaWNrZXJDb21wb25lbnRzLmpzIiwic3JjL3dpZGdldHMvVGFiQmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2paQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2c0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN4TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2hTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzlSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImlmICh0eXBlb2YgaWp6ZXJlbmhlaW4gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWp6ZXJlbmhlaW4gPSB7fTtcbn1cblxuaWp6ZXJlbmhlaW4uRmxleFNjcm9sbFZpZXcgPSByZXF1aXJlKCcuL3NyYy9GbGV4U2Nyb2xsVmlldycpO1xuaWp6ZXJlbmhlaW4uRmxvd0xheW91dE5vZGUgPSByZXF1aXJlKCcuL3NyYy9GbG93TGF5b3V0Tm9kZScpO1xuaWp6ZXJlbmhlaW4uTGF5b3V0Q29udGV4dCA9IHJlcXVpcmUoJy4vc3JjL0xheW91dENvbnRleHQnKTtcbmlqemVyZW5oZWluLkxheW91dENvbnRyb2xsZXIgPSByZXF1aXJlKCcuL3NyYy9MYXlvdXRDb250cm9sbGVyJyk7XG5panplcmVuaGVpbi5MYXlvdXROb2RlID0gcmVxdWlyZSgnLi9zcmMvTGF5b3V0Tm9kZScpO1xuaWp6ZXJlbmhlaW4uTGF5b3V0Tm9kZU1hbmFnZXIgPSByZXF1aXJlKCcuL3NyYy9MYXlvdXROb2RlTWFuYWdlcicpO1xuaWp6ZXJlbmhlaW4uTGF5b3V0VXRpbGl0eSA9IHJlcXVpcmUoJy4vc3JjL0xheW91dFV0aWxpdHknKTtcbmlqemVyZW5oZWluLlNjcm9sbENvbnRyb2xsZXIgPSByZXF1aXJlKCcuL3NyYy9TY3JvbGxDb250cm9sbGVyJyk7XG5panplcmVuaGVpbi5WaXJ0dWFsVmlld1NlcXVlbmNlID0gcmVxdWlyZSgnLi9zcmMvVmlydHVhbFZpZXdTZXF1ZW5jZScpO1xuLy9panplcmVuaGVpbi5TY3JvbGxWaWV3ID0gcmVxdWlyZSgnLi9zcmMvU2Nyb2xsVmlldycpO1xuXG5panplcmVuaGVpbi53aWRnZXRzID0gaWp6ZXJlbmhlaW4ud2lkZ2V0cyB8fCB7fTtcbmlqemVyZW5oZWluLndpZGdldHMuRGF0ZVBpY2tlciA9IHJlcXVpcmUoJy4vc3JjL3dpZGdldHMvRGF0ZVBpY2tlcicpO1xuaWp6ZXJlbmhlaW4ud2lkZ2V0cy5UYWJCYXIgPSByZXF1aXJlKCcuL3NyYy93aWRnZXRzL1RhYkJhcicpO1xuXG5panplcmVuaGVpbi5sYXlvdXQgPSBpanplcmVuaGVpbi5sYXlvdXQgfHwge307XG5panplcmVuaGVpbi5sYXlvdXQuQ29sbGVjdGlvbkxheW91dCA9IHJlcXVpcmUoJy4vc3JjL2xheW91dHMvQ29sbGVjdGlvbkxheW91dCcpO1xuaWp6ZXJlbmhlaW4ubGF5b3V0LkNvdmVyTGF5b3V0ID0gcmVxdWlyZSgnLi9zcmMvbGF5b3V0cy9Db3ZlckxheW91dCcpO1xuaWp6ZXJlbmhlaW4ubGF5b3V0LkN1YmVMYXlvdXQgPSByZXF1aXJlKCcuL3NyYy9sYXlvdXRzL0N1YmVMYXlvdXQnKTtcbmlqemVyZW5oZWluLmxheW91dC5HcmlkTGF5b3V0ID0gcmVxdWlyZSgnLi9zcmMvbGF5b3V0cy9HcmlkTGF5b3V0Jyk7XG5panplcmVuaGVpbi5sYXlvdXQuSGVhZGVyRm9vdGVyTGF5b3V0ID0gcmVxdWlyZSgnLi9zcmMvbGF5b3V0cy9IZWFkZXJGb290ZXJMYXlvdXQnKTtcbmlqemVyZW5oZWluLmxheW91dC5MaXN0TGF5b3V0ID0gcmVxdWlyZSgnLi9zcmMvbGF5b3V0cy9MaXN0TGF5b3V0Jyk7XG5panplcmVuaGVpbi5sYXlvdXQuTmF2QmFyTGF5b3V0ID0gcmVxdWlyZSgnLi9zcmMvbGF5b3V0cy9OYXZCYXJMYXlvdXQnKTtcbmlqemVyZW5oZWluLmxheW91dC5Qcm9wb3J0aW9uYWxMYXlvdXQgPSByZXF1aXJlKCcuL3NyYy9sYXlvdXRzL1Byb3BvcnRpb25hbExheW91dCcpO1xuaWp6ZXJlbmhlaW4ubGF5b3V0LldoZWVsTGF5b3V0ID0gcmVxdWlyZSgnLi9zcmMvbGF5b3V0cy9XaGVlbExheW91dCcpO1xuXG5panplcmVuaGVpbi5oZWxwZXJzID0gaWp6ZXJlbmhlaW4uaGVscGVycyB8fCB7fTtcbmlqemVyZW5oZWluLmhlbHBlcnMuTGF5b3V0RG9ja0hlbHBlciA9IHJlcXVpcmUoJy4vc3JjL2hlbHBlcnMvTGF5b3V0RG9ja0hlbHBlcicpO1xuIiwidmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuL0xheW91dFV0aWxpdHknKTtcbnZhciBTY3JvbGxDb250cm9sbGVyID0gcmVxdWlyZSgnLi9TY3JvbGxDb250cm9sbGVyJyk7XG52YXIgTGlzdExheW91dCA9IHJlcXVpcmUoJy4vbGF5b3V0cy9MaXN0TGF5b3V0Jyk7XG52YXIgUHVsbFRvUmVmcmVzaFN0YXRlID0ge1xuICAgICAgICBISURERU46IDAsXG4gICAgICAgIFBVTExJTkc6IDEsXG4gICAgICAgIEFDVElWRTogMixcbiAgICAgICAgQ09NUExFVEVEOiAzLFxuICAgICAgICBISURESU5HOiA0XG4gICAgfTtcbmZ1bmN0aW9uIEZsZXhTY3JvbGxWaWV3KG9wdGlvbnMpIHtcbiAgICBTY3JvbGxDb250cm9sbGVyLmNhbGwodGhpcywgTGF5b3V0VXRpbGl0eS5jb21iaW5lT3B0aW9ucyhGbGV4U2Nyb2xsVmlldy5ERUZBVUxUX09QVElPTlMsIG9wdGlvbnMpKTtcbiAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhID0gMDtcbiAgICB0aGlzLl9sZWFkaW5nU2Nyb2xsVmlld0RlbHRhID0gMDtcbiAgICB0aGlzLl90cmFpbGluZ1Njcm9sbFZpZXdEZWx0YSA9IDA7XG59XG5GbGV4U2Nyb2xsVmlldy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlKTtcbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEZsZXhTY3JvbGxWaWV3O1xuRmxleFNjcm9sbFZpZXcuUHVsbFRvUmVmcmVzaFN0YXRlID0gUHVsbFRvUmVmcmVzaFN0YXRlO1xuRmxleFNjcm9sbFZpZXcuREVGQVVMVF9PUFRJT05TID0ge1xuICAgIGxheW91dDogTGlzdExheW91dCxcbiAgICBkaXJlY3Rpb246IHVuZGVmaW5lZCxcbiAgICBwYWdpbmF0ZWQ6IGZhbHNlLFxuICAgIGFsaWdubWVudDogMCxcbiAgICBmbG93OiBmYWxzZSxcbiAgICBtb3VzZU1vdmU6IGZhbHNlLFxuICAgIHVzZUNvbnRhaW5lcjogZmFsc2UsXG4gICAgdmlzaWJsZUl0ZW1UaHJlc3Nob2xkOiAwLjUsXG4gICAgcHVsbFRvUmVmcmVzaEhlYWRlcjogdW5kZWZpbmVkLFxuICAgIHB1bGxUb1JlZnJlc2hGb290ZXI6IHVuZGVmaW5lZCxcbiAgICBsZWFkaW5nU2Nyb2xsVmlldzogdW5kZWZpbmVkLFxuICAgIHRyYWlsaW5nU2Nyb2xsVmlldzogdW5kZWZpbmVkXG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnNldE9wdGlvbnMuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICBpZiAob3B0aW9ucy5wdWxsVG9SZWZyZXNoSGVhZGVyIHx8IG9wdGlvbnMucHVsbFRvUmVmcmVzaEZvb3RlciB8fCB0aGlzLl9wdWxsVG9SZWZyZXNoKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnB1bGxUb1JlZnJlc2hIZWFkZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3B1bGxUb1JlZnJlc2ggPSB0aGlzLl9wdWxsVG9SZWZyZXNoIHx8IFtcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9wdWxsVG9SZWZyZXNoWzBdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHVsbFRvUmVmcmVzaFswXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IFB1bGxUb1JlZnJlc2hTdGF0ZS5ISURERU4sXG4gICAgICAgICAgICAgICAgICAgIHByZXZTdGF0ZTogUHVsbFRvUmVmcmVzaFN0YXRlLkhJRERFTixcbiAgICAgICAgICAgICAgICAgICAgZm9vdGVyOiBmYWxzZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9wdWxsVG9SZWZyZXNoWzBdLm5vZGUgPSBvcHRpb25zLnB1bGxUb1JlZnJlc2hIZWFkZXI7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMub3B0aW9ucy5wdWxsVG9SZWZyZXNoSGVhZGVyICYmIHRoaXMuX3B1bGxUb1JlZnJlc2gpIHtcbiAgICAgICAgICAgIHRoaXMuX3B1bGxUb1JlZnJlc2hbMF0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMucHVsbFRvUmVmcmVzaEZvb3Rlcikge1xuICAgICAgICAgICAgdGhpcy5fcHVsbFRvUmVmcmVzaCA9IHRoaXMuX3B1bGxUb1JlZnJlc2ggfHwgW1xuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWRcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3B1bGxUb1JlZnJlc2hbMV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wdWxsVG9SZWZyZXNoWzFdID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogUHVsbFRvUmVmcmVzaFN0YXRlLkhJRERFTixcbiAgICAgICAgICAgICAgICAgICAgcHJldlN0YXRlOiBQdWxsVG9SZWZyZXNoU3RhdGUuSElEREVOLFxuICAgICAgICAgICAgICAgICAgICBmb290ZXI6IHRydWVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fcHVsbFRvUmVmcmVzaFsxXS5ub2RlID0gb3B0aW9ucy5wdWxsVG9SZWZyZXNoRm9vdGVyO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLm9wdGlvbnMucHVsbFRvUmVmcmVzaEZvb3RlciAmJiB0aGlzLl9wdWxsVG9SZWZyZXNoKSB7XG4gICAgICAgICAgICB0aGlzLl9wdWxsVG9SZWZyZXNoWzFdID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9wdWxsVG9SZWZyZXNoICYmICF0aGlzLl9wdWxsVG9SZWZyZXNoWzBdICYmICF0aGlzLl9wdWxsVG9SZWZyZXNoWzFdKSB7XG4gICAgICAgICAgICB0aGlzLl9wdWxsVG9SZWZyZXNoID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5zZXF1ZW5jZUZyb20gPSBmdW5jdGlvbiAobm9kZSkge1xuICAgIHJldHVybiB0aGlzLnNldERhdGFTb3VyY2Uobm9kZSk7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmdldEN1cnJlbnRJbmRleCA9IGZ1bmN0aW9uIGdldEN1cnJlbnRJbmRleCgpIHtcbiAgICB2YXIgaXRlbSA9IHRoaXMuZ2V0Rmlyc3RWaXNpYmxlSXRlbSgpO1xuICAgIHJldHVybiBpdGVtID8gaXRlbS52aWV3U2VxdWVuY2UuZ2V0SW5kZXgoKSA6IC0xO1xufTtcbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5nb1RvUGFnZSA9IGZ1bmN0aW9uIGdvVG9QYWdlKGluZGV4KSB7XG4gICAgdmFyIHZpZXdTZXF1ZW5jZSA9IHRoaXMuX3ZpZXdTZXF1ZW5jZTtcbiAgICBpZiAoIXZpZXdTZXF1ZW5jZSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd2hpbGUgKHZpZXdTZXF1ZW5jZS5nZXRJbmRleCgpIDwgaW5kZXgpIHtcbiAgICAgICAgdmlld1NlcXVlbmNlID0gdmlld1NlcXVlbmNlLmdldE5leHQoKTtcbiAgICAgICAgaWYgKCF2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIHdoaWxlICh2aWV3U2VxdWVuY2UuZ2V0SW5kZXgoKSA+IGluZGV4KSB7XG4gICAgICAgIHZpZXdTZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZS5nZXRQcmV2aW91cygpO1xuICAgICAgICBpZiAoIXZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5nb1RvUmVuZGVyTm9kZSh2aWV3U2VxdWVuY2UuZ2V0KCkpO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5nZXRPZmZzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Njcm9sbE9mZnNldENhY2hlO1xufTtcbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5nZXRQb3NpdGlvbiA9IEZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5nZXRPZmZzZXQ7XG5mdW5jdGlvbiBfc2V0UHVsbFRvUmVmcmVzaFN0YXRlKHB1bGxUb1JlZnJlc2gsIHN0YXRlKSB7XG4gICAgaWYgKHB1bGxUb1JlZnJlc2guc3RhdGUgIT09IHN0YXRlKSB7XG4gICAgICAgIHB1bGxUb1JlZnJlc2guc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgaWYgKHB1bGxUb1JlZnJlc2gubm9kZSAmJiBwdWxsVG9SZWZyZXNoLm5vZGUuc2V0UHVsbFRvUmVmcmVzaFN0YXR1cykge1xuICAgICAgICAgICAgcHVsbFRvUmVmcmVzaC5ub2RlLnNldFB1bGxUb1JlZnJlc2hTdGF0dXMoc3RhdGUpO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gX2dldFB1bGxUb1JlZnJlc2goZm9vdGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX3B1bGxUb1JlZnJlc2ggPyB0aGlzLl9wdWxsVG9SZWZyZXNoW2Zvb3RlciA/IDEgOiAwXSA6IHVuZGVmaW5lZDtcbn1cbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5fcG9zdExheW91dCA9IGZ1bmN0aW9uIChzaXplLCBzY3JvbGxPZmZzZXQpIHtcbiAgICBpZiAoIXRoaXMuX3B1bGxUb1JlZnJlc2gpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmFsaWdubWVudCkge1xuICAgICAgICBzY3JvbGxPZmZzZXQgKz0gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dO1xuICAgIH1cbiAgICB2YXIgcHJldkhlaWdodDtcbiAgICB2YXIgbmV4dEhlaWdodDtcbiAgICB2YXIgdG90YWxIZWlnaHQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyOyBpKyspIHtcbiAgICAgICAgdmFyIHB1bGxUb1JlZnJlc2ggPSB0aGlzLl9wdWxsVG9SZWZyZXNoW2ldO1xuICAgICAgICBpZiAocHVsbFRvUmVmcmVzaCkge1xuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IHB1bGxUb1JlZnJlc2gubm9kZS5nZXRTaXplKClbdGhpcy5fZGlyZWN0aW9uXTtcbiAgICAgICAgICAgIHZhciBwdWxsTGVuZ3RoID0gcHVsbFRvUmVmcmVzaC5ub2RlLmdldFB1bGxUb1JlZnJlc2hTaXplID8gcHVsbFRvUmVmcmVzaC5ub2RlLmdldFB1bGxUb1JlZnJlc2hTaXplKClbdGhpcy5fZGlyZWN0aW9uXSA6IGxlbmd0aDtcbiAgICAgICAgICAgIHZhciBvZmZzZXQ7XG4gICAgICAgICAgICBpZiAoIXB1bGxUb1JlZnJlc2guZm9vdGVyKSB7XG4gICAgICAgICAgICAgICAgcHJldkhlaWdodCA9IHRoaXMuX2NhbGNTY3JvbGxIZWlnaHQoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHByZXZIZWlnaHQgPSBwcmV2SGVpZ2h0ID09PSB1bmRlZmluZWQgPyAtMSA6IHByZXZIZWlnaHQ7XG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gcHJldkhlaWdodCA+PSAwID8gc2Nyb2xsT2Zmc2V0IC0gcHJldkhlaWdodCA6IHByZXZIZWlnaHQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dEhlaWdodCA9IHRoaXMuX2NhbGNTY3JvbGxIZWlnaHQodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIG5leHRIZWlnaHQgPSBuZXh0SGVpZ2h0ID09PSB1bmRlZmluZWQgPyAtMSA6IG5leHRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsSGVpZ2h0ID0gcHJldkhlaWdodCA+PSAwICYmIG5leHRIZWlnaHQgPj0gMCA/IHByZXZIZWlnaHQgKyBuZXh0SGVpZ2h0IDogLTE7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b3RhbEhlaWdodCA+PSAwICYmIHRvdGFsSGVpZ2h0IDwgc2l6ZVt0aGlzLl9kaXJlY3Rpb25dKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBNYXRoLnJvdW5kKHNjcm9sbE9mZnNldCAtIHNpemVbdGhpcy5fZGlyZWN0aW9uXSArIG5leHRIZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXh0SGVpZ2h0ID0gbmV4dEhlaWdodCA9PT0gdW5kZWZpbmVkID8gbmV4dEhlaWdodCA9IHRoaXMuX2NhbGNTY3JvbGxIZWlnaHQodHJ1ZSkgOiBuZXh0SGVpZ2h0O1xuICAgICAgICAgICAgICAgIG5leHRIZWlnaHQgPSBuZXh0SGVpZ2h0ID09PSB1bmRlZmluZWQgPyAtMSA6IG5leHRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gbmV4dEhlaWdodCA+PSAwID8gc2Nyb2xsT2Zmc2V0ICsgbmV4dEhlaWdodCA6IHNpemVbdGhpcy5fZGlyZWN0aW9uXSArIDE7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXZIZWlnaHQgPSBwcmV2SGVpZ2h0ID09PSB1bmRlZmluZWQgPyB0aGlzLl9jYWxjU2Nyb2xsSGVpZ2h0KGZhbHNlKSA6IHByZXZIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIHByZXZIZWlnaHQgPSBwcmV2SGVpZ2h0ID09PSB1bmRlZmluZWQgPyAtMSA6IHByZXZIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsSGVpZ2h0ID0gcHJldkhlaWdodCA+PSAwICYmIG5leHRIZWlnaHQgPj0gMCA/IHByZXZIZWlnaHQgKyBuZXh0SGVpZ2h0IDogLTE7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b3RhbEhlaWdodCA+PSAwICYmIHRvdGFsSGVpZ2h0IDwgc2l6ZVt0aGlzLl9kaXJlY3Rpb25dKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBNYXRoLnJvdW5kKHNjcm9sbE9mZnNldCAtIHByZXZIZWlnaHQgKyBzaXplW3RoaXMuX2RpcmVjdGlvbl0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9mZnNldCA9IC0ob2Zmc2V0IC0gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB2aXNpYmxlUGVyYyA9IE1hdGgubWF4KE1hdGgubWluKG9mZnNldCAvIHB1bGxMZW5ndGgsIDEpLCAwKTtcbiAgICAgICAgICAgIHN3aXRjaCAocHVsbFRvUmVmcmVzaC5zdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSBQdWxsVG9SZWZyZXNoU3RhdGUuSElEREVOOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodmlzaWJsZVBlcmMgPj0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3NldFB1bGxUb1JlZnJlc2hTdGF0ZShwdWxsVG9SZWZyZXNoLCBQdWxsVG9SZWZyZXNoU3RhdGUuQUNUSVZFKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvZmZzZXQgPj0gMC4yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfc2V0UHVsbFRvUmVmcmVzaFN0YXRlKHB1bGxUb1JlZnJlc2gsIFB1bGxUb1JlZnJlc2hTdGF0ZS5QVUxMSU5HKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHVsbFRvUmVmcmVzaFN0YXRlLlBVTExJTkc6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50ICYmIHZpc2libGVQZXJjID49IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgX3NldFB1bGxUb1JlZnJlc2hTdGF0ZShwdWxsVG9SZWZyZXNoLCBQdWxsVG9SZWZyZXNoU3RhdGUuQUNUSVZFKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9mZnNldCA8IDAuMikge1xuICAgICAgICAgICAgICAgICAgICBfc2V0UHVsbFRvUmVmcmVzaFN0YXRlKHB1bGxUb1JlZnJlc2gsIFB1bGxUb1JlZnJlc2hTdGF0ZS5ISURERU4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHVsbFRvUmVmcmVzaFN0YXRlLkFDVElWRTpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHVsbFRvUmVmcmVzaFN0YXRlLkNPTVBMRVRFRDpcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvZmZzZXQgPj0gMC4yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfc2V0UHVsbFRvUmVmcmVzaFN0YXRlKHB1bGxUb1JlZnJlc2gsIFB1bGxUb1JlZnJlc2hTdGF0ZS5ISURESU5HKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9zZXRQdWxsVG9SZWZyZXNoU3RhdGUocHVsbFRvUmVmcmVzaCwgUHVsbFRvUmVmcmVzaFN0YXRlLkhJRERFTik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFB1bGxUb1JlZnJlc2hTdGF0ZS5ISURESU5HOlxuICAgICAgICAgICAgICAgIGlmIChvZmZzZXQgPCAwLjIpIHtcbiAgICAgICAgICAgICAgICAgICAgX3NldFB1bGxUb1JlZnJlc2hTdGF0ZShwdWxsVG9SZWZyZXNoLCBQdWxsVG9SZWZyZXNoU3RhdGUuSElEREVOKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHVsbFRvUmVmcmVzaC5zdGF0ZSAhPT0gUHVsbFRvUmVmcmVzaFN0YXRlLkhJRERFTikge1xuICAgICAgICAgICAgICAgIHZhciBjb250ZXh0Tm9kZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlck5vZGU6IHB1bGxUb1JlZnJlc2gubm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXY6ICFwdWxsVG9SZWZyZXNoLmZvb3RlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQ6IHB1bGxUb1JlZnJlc2guZm9vdGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6ICFwdWxsVG9SZWZyZXNoLmZvb3RlciA/IC0tdGhpcy5fbm9kZXMuX2NvbnRleHRTdGF0ZS5wcmV2R2V0SW5kZXggOiArK3RoaXMuX25vZGVzLl9jb250ZXh0U3RhdGUubmV4dEdldEluZGV4XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIHNjcm9sbExlbmd0aDtcbiAgICAgICAgICAgICAgICBpZiAocHVsbFRvUmVmcmVzaC5zdGF0ZSA9PT0gUHVsbFRvUmVmcmVzaFN0YXRlLkFDVElWRSkge1xuICAgICAgICAgICAgICAgICAgICBzY3JvbGxMZW5ndGggPSBsZW5ndGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICBzY3JvbGxMZW5ndGggPSBNYXRoLm1pbihvZmZzZXQsIGxlbmd0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBzZXQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplWzFdXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0wLjAwMVxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbExlbmd0aDogc2Nyb2xsTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgc2V0LnNpemVbdGhpcy5fZGlyZWN0aW9uXSA9IE1hdGgubWF4KE1hdGgubWluKG9mZnNldCwgcHVsbExlbmd0aCksIDApO1xuICAgICAgICAgICAgICAgIHNldC50cmFuc2xhdGVbdGhpcy5fZGlyZWN0aW9uXSA9IHB1bGxUb1JlZnJlc2guZm9vdGVyID8gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dIC0gbGVuZ3RoIDogMDtcbiAgICAgICAgICAgICAgICB0aGlzLl9ub2Rlcy5fY29udGV4dC5zZXQoY29udGV4dE5vZGUsIHNldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLnNob3dQdWxsVG9SZWZyZXNoID0gZnVuY3Rpb24gKGZvb3Rlcikge1xuICAgIHZhciBwdWxsVG9SZWZyZXNoID0gX2dldFB1bGxUb1JlZnJlc2guY2FsbCh0aGlzLCBmb290ZXIpO1xuICAgIGlmIChwdWxsVG9SZWZyZXNoKSB7XG4gICAgICAgIF9zZXRQdWxsVG9SZWZyZXNoU3RhdGUocHVsbFRvUmVmcmVzaCwgUHVsbFRvUmVmcmVzaFN0YXRlLkFDVElWRSk7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxEaXJ0eSA9IHRydWU7XG4gICAgfVxufTtcbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5oaWRlUHVsbFRvUmVmcmVzaCA9IGZ1bmN0aW9uIChmb290ZXIpIHtcbiAgICB2YXIgcHVsbFRvUmVmcmVzaCA9IF9nZXRQdWxsVG9SZWZyZXNoLmNhbGwodGhpcywgZm9vdGVyKTtcbiAgICBpZiAocHVsbFRvUmVmcmVzaCAmJiBwdWxsVG9SZWZyZXNoLnN0YXRlID09PSBQdWxsVG9SZWZyZXNoU3RhdGUuQUNUSVZFKSB7XG4gICAgICAgIF9zZXRQdWxsVG9SZWZyZXNoU3RhdGUocHVsbFRvUmVmcmVzaCwgUHVsbFRvUmVmcmVzaFN0YXRlLkNPTVBMRVRFRCk7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxEaXJ0eSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5pc1B1bGxUb1JlZnJlc2hWaXNpYmxlID0gZnVuY3Rpb24gKGZvb3Rlcikge1xuICAgIHZhciBwdWxsVG9SZWZyZXNoID0gX2dldFB1bGxUb1JlZnJlc2guY2FsbCh0aGlzLCBmb290ZXIpO1xuICAgIHJldHVybiBwdWxsVG9SZWZyZXNoID8gcHVsbFRvUmVmcmVzaC5zdGF0ZSA9PT0gUHVsbFRvUmVmcmVzaFN0YXRlLkFDVElWRSA6IGZhbHNlO1xufTtcbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5hcHBseVNjcm9sbEZvcmNlID0gZnVuY3Rpb24gKGRlbHRhKSB7XG4gICAgdmFyIGxlYWRpbmdTY3JvbGxWaWV3ID0gdGhpcy5vcHRpb25zLmxlYWRpbmdTY3JvbGxWaWV3O1xuICAgIHZhciB0cmFpbGluZ1Njcm9sbFZpZXcgPSB0aGlzLm9wdGlvbnMudHJhaWxpbmdTY3JvbGxWaWV3O1xuICAgIGlmICghbGVhZGluZ1Njcm9sbFZpZXcgJiYgIXRyYWlsaW5nU2Nyb2xsVmlldykge1xuICAgICAgICByZXR1cm4gU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuYXBwbHlTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIGRlbHRhKTtcbiAgICB9XG4gICAgdmFyIHBhcnRpYWxEZWx0YTtcbiAgICBpZiAoZGVsdGEgPCAwKSB7XG4gICAgICAgIGlmIChsZWFkaW5nU2Nyb2xsVmlldykge1xuICAgICAgICAgICAgcGFydGlhbERlbHRhID0gbGVhZGluZ1Njcm9sbFZpZXcuY2FuU2Nyb2xsKGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX2xlYWRpbmdTY3JvbGxWaWV3RGVsdGEgKz0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgbGVhZGluZ1Njcm9sbFZpZXcuYXBwbHlTY3JvbGxGb3JjZShwYXJ0aWFsRGVsdGEpO1xuICAgICAgICAgICAgZGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cmFpbGluZ1Njcm9sbFZpZXcpIHtcbiAgICAgICAgICAgIHBhcnRpYWxEZWx0YSA9IHRoaXMuY2FuU2Nyb2xsKGRlbHRhKTtcbiAgICAgICAgICAgIFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmFwcGx5U2Nyb2xsRm9yY2UuY2FsbCh0aGlzLCBwYXJ0aWFsRGVsdGEpO1xuICAgICAgICAgICAgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSArPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICBkZWx0YSAtPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICB0cmFpbGluZ1Njcm9sbFZpZXcuYXBwbHlTY3JvbGxGb3JjZShkZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl90cmFpbGluZ1Njcm9sbFZpZXdEZWx0YSArPSBkZWx0YTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmFwcGx5U2Nyb2xsRm9yY2UuY2FsbCh0aGlzLCBkZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhICs9IGRlbHRhO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRyYWlsaW5nU2Nyb2xsVmlldykge1xuICAgICAgICAgICAgcGFydGlhbERlbHRhID0gdHJhaWxpbmdTY3JvbGxWaWV3LmNhblNjcm9sbChkZWx0YSk7XG4gICAgICAgICAgICB0cmFpbGluZ1Njcm9sbFZpZXcuYXBwbHlTY3JvbGxGb3JjZShwYXJ0aWFsRGVsdGEpO1xuICAgICAgICAgICAgdGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEgKz0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgZGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZWFkaW5nU2Nyb2xsVmlldykge1xuICAgICAgICAgICAgcGFydGlhbERlbHRhID0gdGhpcy5jYW5TY3JvbGwoZGVsdGEpO1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuYXBwbHlTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIHBhcnRpYWxEZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhICs9IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIGRlbHRhIC09IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIGxlYWRpbmdTY3JvbGxWaWV3LmFwcGx5U2Nyb2xsRm9yY2UoZGVsdGEpO1xuICAgICAgICAgICAgdGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSArPSBkZWx0YTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmFwcGx5U2Nyb2xsRm9yY2UuY2FsbCh0aGlzLCBkZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhICs9IGRlbHRhO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS51cGRhdGVTY3JvbGxGb3JjZSA9IGZ1bmN0aW9uIChwcmV2RGVsdGEsIG5ld0RlbHRhKSB7XG4gICAgdmFyIGxlYWRpbmdTY3JvbGxWaWV3ID0gdGhpcy5vcHRpb25zLmxlYWRpbmdTY3JvbGxWaWV3O1xuICAgIHZhciB0cmFpbGluZ1Njcm9sbFZpZXcgPSB0aGlzLm9wdGlvbnMudHJhaWxpbmdTY3JvbGxWaWV3O1xuICAgIGlmICghbGVhZGluZ1Njcm9sbFZpZXcgJiYgIXRyYWlsaW5nU2Nyb2xsVmlldykge1xuICAgICAgICByZXR1cm4gU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlU2Nyb2xsRm9yY2UuY2FsbCh0aGlzLCBwcmV2RGVsdGEsIG5ld0RlbHRhKTtcbiAgICB9XG4gICAgdmFyIHBhcnRpYWxEZWx0YTtcbiAgICB2YXIgZGVsdGEgPSBuZXdEZWx0YSAtIHByZXZEZWx0YTtcbiAgICBpZiAoZGVsdGEgPCAwKSB7XG4gICAgICAgIGlmIChsZWFkaW5nU2Nyb2xsVmlldykge1xuICAgICAgICAgICAgcGFydGlhbERlbHRhID0gbGVhZGluZ1Njcm9sbFZpZXcuY2FuU2Nyb2xsKGRlbHRhKTtcbiAgICAgICAgICAgIGxlYWRpbmdTY3JvbGxWaWV3LnVwZGF0ZVNjcm9sbEZvcmNlKHRoaXMuX2xlYWRpbmdTY3JvbGxWaWV3RGVsdGEsIHRoaXMuX2xlYWRpbmdTY3JvbGxWaWV3RGVsdGEgKyBwYXJ0aWFsRGVsdGEpO1xuICAgICAgICAgICAgdGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSArPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICBkZWx0YSAtPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYWlsaW5nU2Nyb2xsVmlldyAmJiBkZWx0YSkge1xuICAgICAgICAgICAgcGFydGlhbERlbHRhID0gdGhpcy5jYW5TY3JvbGwoZGVsdGEpO1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlU2Nyb2xsRm9yY2UuY2FsbCh0aGlzLCB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhLCB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhICsgcGFydGlhbERlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKz0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgZGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgdGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEgKz0gZGVsdGE7XG4gICAgICAgICAgICB0cmFpbGluZ1Njcm9sbFZpZXcudXBkYXRlU2Nyb2xsRm9yY2UodGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEsIHRoaXMuX3RyYWlsaW5nU2Nyb2xsVmlld0RlbHRhICsgZGVsdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKGRlbHRhKSB7XG4gICAgICAgICAgICBTY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEsIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKyBkZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhICs9IGRlbHRhO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRyYWlsaW5nU2Nyb2xsVmlldykge1xuICAgICAgICAgICAgcGFydGlhbERlbHRhID0gdHJhaWxpbmdTY3JvbGxWaWV3LmNhblNjcm9sbChkZWx0YSk7XG4gICAgICAgICAgICB0cmFpbGluZ1Njcm9sbFZpZXcudXBkYXRlU2Nyb2xsRm9yY2UodGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEsIHRoaXMuX3RyYWlsaW5nU2Nyb2xsVmlld0RlbHRhICsgcGFydGlhbERlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RyYWlsaW5nU2Nyb2xsVmlld0RlbHRhICs9IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIGRlbHRhIC09IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVhZGluZ1Njcm9sbFZpZXcpIHtcbiAgICAgICAgICAgIHBhcnRpYWxEZWx0YSA9IHRoaXMuY2FuU2Nyb2xsKGRlbHRhKTtcbiAgICAgICAgICAgIFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVNjcm9sbEZvcmNlLmNhbGwodGhpcywgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSwgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSArIHBhcnRpYWxEZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhICs9IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIGRlbHRhIC09IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIGxlYWRpbmdTY3JvbGxWaWV3LnVwZGF0ZVNjcm9sbEZvcmNlKHRoaXMuX2xlYWRpbmdTY3JvbGxWaWV3RGVsdGEsIHRoaXMuX2xlYWRpbmdTY3JvbGxWaWV3RGVsdGEgKyBkZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl9sZWFkaW5nU2Nyb2xsVmlld0RlbHRhICs9IGRlbHRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlU2Nyb2xsRm9yY2UuY2FsbCh0aGlzLCB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhLCB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhICsgZGVsdGEpO1xuICAgICAgICAgICAgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSArPSBkZWx0YTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5GbGV4U2Nyb2xsVmlldy5wcm90b3R5cGUucmVsZWFzZVNjcm9sbEZvcmNlID0gZnVuY3Rpb24gKGRlbHRhLCB2ZWxvY2l0eSkge1xuICAgIHZhciBsZWFkaW5nU2Nyb2xsVmlldyA9IHRoaXMub3B0aW9ucy5sZWFkaW5nU2Nyb2xsVmlldztcbiAgICB2YXIgdHJhaWxpbmdTY3JvbGxWaWV3ID0gdGhpcy5vcHRpb25zLnRyYWlsaW5nU2Nyb2xsVmlldztcbiAgICBpZiAoIWxlYWRpbmdTY3JvbGxWaWV3ICYmICF0cmFpbGluZ1Njcm9sbFZpZXcpIHtcbiAgICAgICAgcmV0dXJuIFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnJlbGVhc2VTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIGRlbHRhLCB2ZWxvY2l0eSk7XG4gICAgfVxuICAgIHZhciBwYXJ0aWFsRGVsdGE7XG4gICAgaWYgKGRlbHRhIDwgMCkge1xuICAgICAgICBpZiAobGVhZGluZ1Njcm9sbFZpZXcpIHtcbiAgICAgICAgICAgIHBhcnRpYWxEZWx0YSA9IE1hdGgubWF4KHRoaXMuX2xlYWRpbmdTY3JvbGxWaWV3RGVsdGEsIGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX2xlYWRpbmdTY3JvbGxWaWV3RGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgZGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgbGVhZGluZ1Njcm9sbFZpZXcucmVsZWFzZVNjcm9sbEZvcmNlKHRoaXMuX2xlYWRpbmdTY3JvbGxWaWV3RGVsdGEsIGRlbHRhID8gMCA6IHZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhaWxpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgICAgICBwYXJ0aWFsRGVsdGEgPSBNYXRoLm1heCh0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhLCBkZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhIC09IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIGRlbHRhIC09IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnJlbGVhc2VTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEsIGRlbHRhID8gMCA6IHZlbG9jaXR5KTtcbiAgICAgICAgICAgIHRoaXMuX3RyYWlsaW5nU2Nyb2xsVmlld0RlbHRhIC09IGRlbHRhO1xuICAgICAgICAgICAgdHJhaWxpbmdTY3JvbGxWaWV3LnJlbGVhc2VTY3JvbGxGb3JjZSh0aGlzLl90cmFpbGluZ1Njcm9sbFZpZXdEZWx0YSwgZGVsdGEgPyB2ZWxvY2l0eSA6IDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSAtPSBkZWx0YTtcbiAgICAgICAgICAgIFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnJlbGVhc2VTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEsIGRlbHRhID8gdmVsb2NpdHkgOiAwKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0cmFpbGluZ1Njcm9sbFZpZXcpIHtcbiAgICAgICAgICAgIHBhcnRpYWxEZWx0YSA9IE1hdGgubWluKHRoaXMuX3RyYWlsaW5nU2Nyb2xsVmlld0RlbHRhLCBkZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl90cmFpbGluZ1Njcm9sbFZpZXdEZWx0YSAtPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICBkZWx0YSAtPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICB0cmFpbGluZ1Njcm9sbFZpZXcucmVsZWFzZVNjcm9sbEZvcmNlKHRoaXMuX3RyYWlsaW5nU2Nyb2xsVmlld0RlbHRhLCBkZWx0YSA/IDAgOiB2ZWxvY2l0eSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlYWRpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgICAgICBwYXJ0aWFsRGVsdGEgPSBNYXRoLm1pbih0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhLCBkZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhIC09IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIGRlbHRhIC09IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnJlbGVhc2VTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEsIGRlbHRhID8gMCA6IHZlbG9jaXR5KTtcbiAgICAgICAgICAgIHRoaXMuX2xlYWRpbmdTY3JvbGxWaWV3RGVsdGEgLT0gZGVsdGE7XG4gICAgICAgICAgICBsZWFkaW5nU2Nyb2xsVmlldy5yZWxlYXNlU2Nyb2xsRm9yY2UodGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSwgZGVsdGEgPyB2ZWxvY2l0eSA6IDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSAtPSBkZWx0YTtcbiAgICAgICAgICAgIFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVNjcm9sbEZvcmNlLmNhbGwodGhpcywgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSwgZGVsdGEgPyB2ZWxvY2l0eSA6IDApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5jb21taXQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSBTY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5jb21taXQuY2FsbCh0aGlzLCBjb250ZXh0KTtcbiAgICBpZiAodGhpcy5fcHVsbFRvUmVmcmVzaCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI7IGkrKykge1xuICAgICAgICAgICAgdmFyIHB1bGxUb1JlZnJlc2ggPSB0aGlzLl9wdWxsVG9SZWZyZXNoW2ldO1xuICAgICAgICAgICAgaWYgKHB1bGxUb1JlZnJlc2gpIHtcbiAgICAgICAgICAgICAgICBpZiAocHVsbFRvUmVmcmVzaC5zdGF0ZSA9PT0gUHVsbFRvUmVmcmVzaFN0YXRlLkFDVElWRSAmJiBwdWxsVG9SZWZyZXNoLnByZXZTdGF0ZSAhPT0gUHVsbFRvUmVmcmVzaFN0YXRlLkFDVElWRSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdyZWZyZXNoJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9vdGVyOiBwdWxsVG9SZWZyZXNoLmZvb3RlclxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHVsbFRvUmVmcmVzaC5wcmV2U3RhdGUgPSBwdWxsVG9SZWZyZXNoLnN0YXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBGbGV4U2Nyb2xsVmlldzsiLCJ2YXIgT3B0aW9uc01hbmFnZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5PcHRpb25zTWFuYWdlciA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLk9wdGlvbnNNYW5hZ2VyIDogbnVsbDtcbnZhciBUcmFuc2Zvcm0gPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5UcmFuc2Zvcm0gOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5UcmFuc2Zvcm0gOiBudWxsO1xudmFyIFZlY3RvciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5tYXRoLlZlY3RvciA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5tYXRoLlZlY3RvciA6IG51bGw7XG52YXIgUGFydGljbGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMucGh5c2ljcy5ib2RpZXMuUGFydGljbGUgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMucGh5c2ljcy5ib2RpZXMuUGFydGljbGUgOiBudWxsO1xudmFyIFNwcmluZyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5waHlzaWNzLmZvcmNlcy5TcHJpbmcgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMucGh5c2ljcy5mb3JjZXMuU3ByaW5nIDogbnVsbDtcbnZhciBQaHlzaWNzRW5naW5lID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLnBoeXNpY3MuUGh5c2ljc0VuZ2luZSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5waHlzaWNzLlBoeXNpY3NFbmdpbmUgOiBudWxsO1xudmFyIExheW91dE5vZGUgPSByZXF1aXJlKCcuL0xheW91dE5vZGUnKTtcbnZhciBUcmFuc2l0aW9uYWJsZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy50cmFuc2l0aW9ucy5UcmFuc2l0aW9uYWJsZSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy50cmFuc2l0aW9ucy5UcmFuc2l0aW9uYWJsZSA6IG51bGw7XG5mdW5jdGlvbiBGbG93TGF5b3V0Tm9kZShyZW5kZXJOb2RlLCBzcGVjKSB7XG4gICAgTGF5b3V0Tm9kZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICghdGhpcy5vcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5jcmVhdGUodGhpcy5jb25zdHJ1Y3Rvci5ERUZBVUxUX09QVElPTlMpO1xuICAgICAgICB0aGlzLl9vcHRpb25zTWFuYWdlciA9IG5ldyBPcHRpb25zTWFuYWdlcih0aGlzLm9wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuX3BlKSB7XG4gICAgICAgIHRoaXMuX3BlID0gbmV3IFBoeXNpY3NFbmdpbmUoKTtcbiAgICAgICAgdGhpcy5fcGUuc2xlZXAoKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9wcm9wZXJ0aWVzKSB7XG4gICAgICAgIHRoaXMuX3Byb3BlcnRpZXMgPSB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBwcm9wTmFtZSBpbiB0aGlzLl9wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICB0aGlzLl9wcm9wZXJ0aWVzW3Byb3BOYW1lXS5pbml0ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCF0aGlzLl9sb2NrVHJhbnNpdGlvbmFibGUpIHtcbiAgICAgICAgdGhpcy5fbG9ja1RyYW5zaXRpb25hYmxlID0gbmV3IFRyYW5zaXRpb25hYmxlKDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2xvY2tUcmFuc2l0aW9uYWJsZS5oYWx0KCk7XG4gICAgICAgIHRoaXMuX2xvY2tUcmFuc2l0aW9uYWJsZS5yZXNldCgxKTtcbiAgICB9XG4gICAgdGhpcy5fc3BlY01vZGlmaWVkID0gdHJ1ZTtcbiAgICB0aGlzLl9pbml0aWFsID0gdHJ1ZTtcbiAgICBpZiAoc3BlYykge1xuICAgICAgICB0aGlzLnNldFNwZWMoc3BlYyk7XG4gICAgfVxufVxuRmxvd0xheW91dE5vZGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShMYXlvdXROb2RlLnByb3RvdHlwZSk7XG5GbG93TGF5b3V0Tm9kZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBGbG93TGF5b3V0Tm9kZTtcbkZsb3dMYXlvdXROb2RlLkRFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICBzcHJpbmc6IHtcbiAgICAgICAgZGFtcGluZ1JhdGlvOiAwLjgsXG4gICAgICAgIHBlcmlvZDogMzAwXG4gICAgfSxcbiAgICBwYXJ0aWNsZVJvdW5kaW5nOiAwLjAwMVxufTtcbnZhciBERUZBVUxUID0ge1xuICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICBvcGFjaXR5MkQ6IFtcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgYWxpZ246IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHNjYWxlOiBbXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDFcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgcm90YXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgc2tldzogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF1cbiAgICB9O1xuRmxvd0xheW91dE5vZGUucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHRoaXMuX29wdGlvbnNNYW5hZ2VyLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdmFyIHdhc1NsZWVwaW5nID0gdGhpcy5fcGUuaXNTbGVlcGluZygpO1xuICAgIGZvciAodmFyIHByb3BOYW1lIGluIHRoaXMuX3Byb3BlcnRpZXMpIHtcbiAgICAgICAgdmFyIHByb3AgPSB0aGlzLl9wcm9wZXJ0aWVzW3Byb3BOYW1lXTtcbiAgICAgICAgaWYgKHByb3AuZm9yY2UpIHtcbiAgICAgICAgICAgIHByb3AuZm9yY2Uuc2V0T3B0aW9ucyhwcm9wLmZvcmNlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAod2FzU2xlZXBpbmcpIHtcbiAgICAgICAgdGhpcy5fcGUuc2xlZXAoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRmxvd0xheW91dE5vZGUucHJvdG90eXBlLnNldFNwZWMgPSBmdW5jdGlvbiAoc3BlYykge1xuICAgIHZhciBzZXQ7XG4gICAgaWYgKHNwZWMudHJhbnNmb3JtKSB7XG4gICAgICAgIHNldCA9IFRyYW5zZm9ybS5pbnRlcnByZXQoc3BlYy50cmFuc2Zvcm0pO1xuICAgIH1cbiAgICBpZiAoIXNldCkge1xuICAgICAgICBzZXQgPSB7fTtcbiAgICB9XG4gICAgc2V0Lm9wYWNpdHkgPSBzcGVjLm9wYWNpdHk7XG4gICAgc2V0LnNpemUgPSBzcGVjLnNpemU7XG4gICAgc2V0LmFsaWduID0gc3BlYy5hbGlnbjtcbiAgICBzZXQub3JpZ2luID0gc3BlYy5vcmlnaW47XG4gICAgdmFyIG9sZFJlbW92aW5nID0gdGhpcy5fcmVtb3Zpbmc7XG4gICAgdmFyIG9sZEludmFsaWRhdGVkID0gdGhpcy5faW52YWxpZGF0ZWQ7XG4gICAgdGhpcy5zZXQoc2V0KTtcbiAgICB0aGlzLl9yZW1vdmluZyA9IG9sZFJlbW92aW5nO1xuICAgIHRoaXMuX2ludmFsaWRhdGVkID0gb2xkSW52YWxpZGF0ZWQ7XG59O1xuRmxvd0xheW91dE5vZGUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9pbnZhbGlkYXRlZCkge1xuICAgICAgICBmb3IgKHZhciBwcm9wTmFtZSBpbiB0aGlzLl9wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICB0aGlzLl9wcm9wZXJ0aWVzW3Byb3BOYW1lXS5pbnZhbGlkYXRlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2ludmFsaWRhdGVkID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMudHJ1ZVNpemVSZXF1ZXN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLnVzZXNUcnVlU2l6ZSA9IGZhbHNlO1xufTtcbkZsb3dMYXlvdXROb2RlLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAocmVtb3ZlU3BlYykge1xuICAgIHRoaXMuX3JlbW92aW5nID0gdHJ1ZTtcbiAgICBpZiAocmVtb3ZlU3BlYykge1xuICAgICAgICB0aGlzLnNldFNwZWMocmVtb3ZlU3BlYyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcGUuc2xlZXAoKTtcbiAgICAgICAgdGhpcy5fc3BlY01vZGlmaWVkID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuX2ludmFsaWRhdGVkID0gZmFsc2U7XG59O1xuRmxvd0xheW91dE5vZGUucHJvdG90eXBlLnJlbGVhc2VMb2NrID0gZnVuY3Rpb24gKGR1cmF0aW9uKSB7XG4gICAgdGhpcy5fbG9ja1RyYW5zaXRpb25hYmxlLmhhbHQoKTtcbiAgICB0aGlzLl9sb2NrVHJhbnNpdGlvbmFibGUucmVzZXQoMCk7XG4gICAgdGhpcy5fbG9ja1RyYW5zaXRpb25hYmxlLnNldCgxLCB7IGR1cmF0aW9uOiBkdXJhdGlvbiB8fCB0aGlzLm9wdGlvbnMuc3ByaW5nLnBlcmlvZCB8fCAxMDAwIH0pO1xufTtcbmZ1bmN0aW9uIF9nZXRSb3VuZGVkVmFsdWUzRChwcm9wLCBkZWYsIHByZWNpc2lvbiwgbG9ja1ZhbHVlKSB7XG4gICAgaWYgKCFwcm9wIHx8ICFwcm9wLmluaXQpIHtcbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICB9XG4gICAgcmV0dXJuIFtcbiAgICAgICAgTWF0aC5yb3VuZCgocHJvcC5jdXJTdGF0ZS54ICsgKHByb3AuZW5kU3RhdGUueCAtIHByb3AuY3VyU3RhdGUueCkgKiBsb2NrVmFsdWUpIC8gcHJlY2lzaW9uKSAqIHByZWNpc2lvbixcbiAgICAgICAgTWF0aC5yb3VuZCgocHJvcC5jdXJTdGF0ZS55ICsgKHByb3AuZW5kU3RhdGUueSAtIHByb3AuY3VyU3RhdGUueSkgKiBsb2NrVmFsdWUpIC8gcHJlY2lzaW9uKSAqIHByZWNpc2lvbixcbiAgICAgICAgTWF0aC5yb3VuZCgocHJvcC5jdXJTdGF0ZS56ICsgKHByb3AuZW5kU3RhdGUueiAtIHByb3AuY3VyU3RhdGUueikgKiBsb2NrVmFsdWUpIC8gcHJlY2lzaW9uKSAqIHByZWNpc2lvblxuICAgIF07XG59XG5GbG93TGF5b3V0Tm9kZS5wcm90b3R5cGUuZ2V0U3BlYyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZW5kU3RhdGVSZWFjaGVkID0gdGhpcy5fcGUuaXNTbGVlcGluZygpO1xuICAgIGlmICghdGhpcy5fc3BlY01vZGlmaWVkICYmIGVuZFN0YXRlUmVhY2hlZCkge1xuICAgICAgICB0aGlzLl9zcGVjLnJlbW92ZWQgPSAhdGhpcy5faW52YWxpZGF0ZWQ7XG4gICAgICAgIHJldHVybiB0aGlzLl9zcGVjO1xuICAgIH1cbiAgICB0aGlzLl9pbml0aWFsID0gZmFsc2U7XG4gICAgdGhpcy5fc3BlY01vZGlmaWVkID0gIWVuZFN0YXRlUmVhY2hlZDtcbiAgICB0aGlzLl9zcGVjLnJlbW92ZWQgPSBmYWxzZTtcbiAgICBpZiAoIWVuZFN0YXRlUmVhY2hlZCkge1xuICAgICAgICB0aGlzLl9wZS5zdGVwKCk7XG4gICAgfVxuICAgIHZhciBzcGVjID0gdGhpcy5fc3BlYztcbiAgICB2YXIgcHJlY2lzaW9uID0gdGhpcy5vcHRpb25zLnBhcnRpY2xlUm91bmRpbmc7XG4gICAgdmFyIGxvY2tWYWx1ZSA9IHRoaXMuX2xvY2tUcmFuc2l0aW9uYWJsZS5nZXQoKTtcbiAgICB2YXIgcHJvcCA9IHRoaXMuX3Byb3BlcnRpZXMub3BhY2l0eTtcbiAgICBpZiAocHJvcCAmJiBwcm9wLmluaXQpIHtcbiAgICAgICAgc3BlYy5vcGFjaXR5ID0gTWF0aC5yb3VuZChNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBwcm9wLmN1clN0YXRlLngpKSAvIHByZWNpc2lvbikgKiBwcmVjaXNpb247XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3BlYy5vcGFjaXR5ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBwcm9wID0gdGhpcy5fcHJvcGVydGllcy5zaXplO1xuICAgIGlmIChwcm9wICYmIHByb3AuaW5pdCkge1xuICAgICAgICBzcGVjLnNpemUgPSBzcGVjLnNpemUgfHwgW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXTtcbiAgICAgICAgc3BlYy5zaXplWzBdID0gTWF0aC5yb3VuZCgocHJvcC5jdXJTdGF0ZS54ICsgKHByb3AuZW5kU3RhdGUueCAtIHByb3AuY3VyU3RhdGUueCkgKiBsb2NrVmFsdWUpIC8gMC4xKSAqIDAuMTtcbiAgICAgICAgc3BlYy5zaXplWzFdID0gTWF0aC5yb3VuZCgocHJvcC5jdXJTdGF0ZS55ICsgKHByb3AuZW5kU3RhdGUueSAtIHByb3AuY3VyU3RhdGUueSkgKiBsb2NrVmFsdWUpIC8gMC4xKSAqIDAuMTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzcGVjLnNpemUgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHByb3AgPSB0aGlzLl9wcm9wZXJ0aWVzLmFsaWduO1xuICAgIGlmIChwcm9wICYmIHByb3AuaW5pdCkge1xuICAgICAgICBzcGVjLmFsaWduID0gc3BlYy5hbGlnbiB8fCBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdO1xuICAgICAgICBzcGVjLmFsaWduWzBdID0gTWF0aC5yb3VuZCgocHJvcC5jdXJTdGF0ZS54ICsgKHByb3AuZW5kU3RhdGUueCAtIHByb3AuY3VyU3RhdGUueCkgKiBsb2NrVmFsdWUpIC8gMC4xKSAqIDAuMTtcbiAgICAgICAgc3BlYy5hbGlnblsxXSA9IE1hdGgucm91bmQoKHByb3AuY3VyU3RhdGUueSArIChwcm9wLmVuZFN0YXRlLnkgLSBwcm9wLmN1clN0YXRlLnkpICogbG9ja1ZhbHVlKSAvIDAuMSkgKiAwLjE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3BlYy5hbGlnbiA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcHJvcCA9IHRoaXMuX3Byb3BlcnRpZXMub3JpZ2luO1xuICAgIGlmIChwcm9wICYmIHByb3AuaW5pdCkge1xuICAgICAgICBzcGVjLm9yaWdpbiA9IHNwZWMub3JpZ2luIHx8IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF07XG4gICAgICAgIHNwZWMub3JpZ2luWzBdID0gTWF0aC5yb3VuZCgocHJvcC5jdXJTdGF0ZS54ICsgKHByb3AuZW5kU3RhdGUueCAtIHByb3AuY3VyU3RhdGUueCkgKiBsb2NrVmFsdWUpIC8gMC4xKSAqIDAuMTtcbiAgICAgICAgc3BlYy5vcmlnaW5bMV0gPSBNYXRoLnJvdW5kKChwcm9wLmN1clN0YXRlLnkgKyAocHJvcC5lbmRTdGF0ZS55IC0gcHJvcC5jdXJTdGF0ZS55KSAqIGxvY2tWYWx1ZSkgLyAwLjEpICogMC4xO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNwZWMub3JpZ2luID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB2YXIgdHJhbnNsYXRlID0gdGhpcy5fcHJvcGVydGllcy50cmFuc2xhdGU7XG4gICAgdmFyIHRyYW5zbGF0ZVg7XG4gICAgdmFyIHRyYW5zbGF0ZVk7XG4gICAgdmFyIHRyYW5zbGF0ZVo7XG4gICAgaWYgKHRyYW5zbGF0ZSAmJiB0cmFuc2xhdGUuaW5pdCkge1xuICAgICAgICB0cmFuc2xhdGVYID0gTWF0aC5yb3VuZCgodHJhbnNsYXRlLmN1clN0YXRlLnggKyAodHJhbnNsYXRlLmVuZFN0YXRlLnggLSB0cmFuc2xhdGUuY3VyU3RhdGUueCkgKiBsb2NrVmFsdWUpIC8gcHJlY2lzaW9uKSAqIHByZWNpc2lvbjtcbiAgICAgICAgdHJhbnNsYXRlWSA9IE1hdGgucm91bmQoKHRyYW5zbGF0ZS5jdXJTdGF0ZS55ICsgKHRyYW5zbGF0ZS5lbmRTdGF0ZS55IC0gdHJhbnNsYXRlLmN1clN0YXRlLnkpICogbG9ja1ZhbHVlKSAvIHByZWNpc2lvbikgKiBwcmVjaXNpb247XG4gICAgICAgIHRyYW5zbGF0ZVogPSBNYXRoLnJvdW5kKCh0cmFuc2xhdGUuY3VyU3RhdGUueiArICh0cmFuc2xhdGUuZW5kU3RhdGUueiAtIHRyYW5zbGF0ZS5jdXJTdGF0ZS56KSAqIGxvY2tWYWx1ZSkgLyBwcmVjaXNpb24pICogcHJlY2lzaW9uO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRyYW5zbGF0ZVggPSAwO1xuICAgICAgICB0cmFuc2xhdGVZID0gMDtcbiAgICAgICAgdHJhbnNsYXRlWiA9IDA7XG4gICAgfVxuICAgIHZhciBzY2FsZSA9IHRoaXMuX3Byb3BlcnRpZXMuc2NhbGU7XG4gICAgdmFyIHNrZXcgPSB0aGlzLl9wcm9wZXJ0aWVzLnNrZXc7XG4gICAgdmFyIHJvdGF0ZSA9IHRoaXMuX3Byb3BlcnRpZXMucm90YXRlO1xuICAgIGlmIChzY2FsZSB8fCBza2V3IHx8IHJvdGF0ZSkge1xuICAgICAgICBzcGVjLnRyYW5zZm9ybSA9IFRyYW5zZm9ybS5idWlsZCh7XG4gICAgICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVYLFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVksXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlWlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHNrZXc6IF9nZXRSb3VuZGVkVmFsdWUzRC5jYWxsKHRoaXMsIHNrZXcsIERFRkFVTFQuc2tldywgdGhpcy5vcHRpb25zLnBhcnRpY2xlUm91bmRpbmcsIGxvY2tWYWx1ZSksXG4gICAgICAgICAgICBzY2FsZTogX2dldFJvdW5kZWRWYWx1ZTNELmNhbGwodGhpcywgc2NhbGUsIERFRkFVTFQuc2NhbGUsIHRoaXMub3B0aW9ucy5wYXJ0aWNsZVJvdW5kaW5nLCBsb2NrVmFsdWUpLFxuICAgICAgICAgICAgcm90YXRlOiBfZ2V0Um91bmRlZFZhbHVlM0QuY2FsbCh0aGlzLCByb3RhdGUsIERFRkFVTFQucm90YXRlLCB0aGlzLm9wdGlvbnMucGFydGljbGVSb3VuZGluZywgbG9ja1ZhbHVlKVxuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRyYW5zbGF0ZSkge1xuICAgICAgICBpZiAoIXNwZWMudHJhbnNmb3JtKSB7XG4gICAgICAgICAgICBzcGVjLnRyYW5zZm9ybSA9IFRyYW5zZm9ybS50cmFuc2xhdGUodHJhbnNsYXRlWCwgdHJhbnNsYXRlWSwgdHJhbnNsYXRlWik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzcGVjLnRyYW5zZm9ybVsxMl0gPSB0cmFuc2xhdGVYO1xuICAgICAgICAgICAgc3BlYy50cmFuc2Zvcm1bMTNdID0gdHJhbnNsYXRlWTtcbiAgICAgICAgICAgIHNwZWMudHJhbnNmb3JtWzE0XSA9IHRyYW5zbGF0ZVo7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBzcGVjLnRyYW5zZm9ybSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3NwZWM7XG59O1xuZnVuY3Rpb24gX3NldFByb3BlcnR5VmFsdWUocHJvcCwgcHJvcE5hbWUsIGVuZFN0YXRlLCBkZWZhdWx0VmFsdWUsIGltbWVkaWF0ZSwgaXNUcmFuc2xhdGUpIHtcbiAgICBwcm9wID0gcHJvcCB8fCB0aGlzLl9wcm9wZXJ0aWVzW3Byb3BOYW1lXTtcbiAgICBpZiAocHJvcCAmJiBwcm9wLmluaXQpIHtcbiAgICAgICAgcHJvcC5pbnZhbGlkYXRlZCA9IHRydWU7XG4gICAgICAgIHZhciB2YWx1ZSA9IGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgaWYgKGVuZFN0YXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhbHVlID0gZW5kU3RhdGU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcmVtb3ZpbmcpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcHJvcC5wYXJ0aWNsZS5nZXRQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIHByb3AuZW5kU3RhdGUueCA9IHZhbHVlWzBdO1xuICAgICAgICBwcm9wLmVuZFN0YXRlLnkgPSB2YWx1ZS5sZW5ndGggPiAxID8gdmFsdWVbMV0gOiAwO1xuICAgICAgICBwcm9wLmVuZFN0YXRlLnogPSB2YWx1ZS5sZW5ndGggPiAyID8gdmFsdWVbMl0gOiAwO1xuICAgICAgICBpZiAoaW1tZWRpYXRlKSB7XG4gICAgICAgICAgICBwcm9wLmN1clN0YXRlLnggPSBwcm9wLmVuZFN0YXRlLng7XG4gICAgICAgICAgICBwcm9wLmN1clN0YXRlLnkgPSBwcm9wLmVuZFN0YXRlLnk7XG4gICAgICAgICAgICBwcm9wLmN1clN0YXRlLnogPSBwcm9wLmVuZFN0YXRlLno7XG4gICAgICAgICAgICBwcm9wLnZlbG9jaXR5LnggPSAwO1xuICAgICAgICAgICAgcHJvcC52ZWxvY2l0eS55ID0gMDtcbiAgICAgICAgICAgIHByb3AudmVsb2NpdHkueiA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvcC5lbmRTdGF0ZS54ICE9PSBwcm9wLmN1clN0YXRlLnggfHwgcHJvcC5lbmRTdGF0ZS55ICE9PSBwcm9wLmN1clN0YXRlLnkgfHwgcHJvcC5lbmRTdGF0ZS56ICE9PSBwcm9wLmN1clN0YXRlLnopIHtcbiAgICAgICAgICAgIHRoaXMuX3BlLndha2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHdhc1NsZWVwaW5nID0gdGhpcy5fcGUuaXNTbGVlcGluZygpO1xuICAgICAgICBpZiAoIXByb3ApIHtcbiAgICAgICAgICAgIHByb3AgPSB7XG4gICAgICAgICAgICAgICAgcGFydGljbGU6IG5ldyBQYXJ0aWNsZSh7IHBvc2l0aW9uOiB0aGlzLl9pbml0aWFsIHx8IGltbWVkaWF0ZSA/IGVuZFN0YXRlIDogZGVmYXVsdFZhbHVlIH0pLFxuICAgICAgICAgICAgICAgIGVuZFN0YXRlOiBuZXcgVmVjdG9yKGVuZFN0YXRlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHByb3AuY3VyU3RhdGUgPSBwcm9wLnBhcnRpY2xlLnBvc2l0aW9uO1xuICAgICAgICAgICAgcHJvcC52ZWxvY2l0eSA9IHByb3AucGFydGljbGUudmVsb2NpdHk7XG4gICAgICAgICAgICBwcm9wLmZvcmNlID0gbmV3IFNwcmluZyh0aGlzLm9wdGlvbnMuc3ByaW5nKTtcbiAgICAgICAgICAgIHByb3AuZm9yY2Uuc2V0T3B0aW9ucyh7IGFuY2hvcjogcHJvcC5lbmRTdGF0ZSB9KTtcbiAgICAgICAgICAgIHRoaXMuX3BlLmFkZEJvZHkocHJvcC5wYXJ0aWNsZSk7XG4gICAgICAgICAgICBwcm9wLmZvcmNlSWQgPSB0aGlzLl9wZS5hdHRhY2gocHJvcC5mb3JjZSwgcHJvcC5wYXJ0aWNsZSk7XG4gICAgICAgICAgICB0aGlzLl9wcm9wZXJ0aWVzW3Byb3BOYW1lXSA9IHByb3A7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9wLnBhcnRpY2xlLnNldFBvc2l0aW9uKHRoaXMuX2luaXRpYWwgfHwgaW1tZWRpYXRlID8gZW5kU3RhdGUgOiBkZWZhdWx0VmFsdWUpO1xuICAgICAgICAgICAgcHJvcC5lbmRTdGF0ZS5zZXQoZW5kU3RhdGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faW5pdGlhbCAmJiAhaW1tZWRpYXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9wZS53YWtlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAod2FzU2xlZXBpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX3BlLnNsZWVwKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvcC5pbml0ID0gdHJ1ZTtcbiAgICAgICAgcHJvcC5pbnZhbGlkYXRlZCA9IHRydWU7XG4gICAgfVxufVxuZnVuY3Rpb24gX2dldElmTkUyRChhMSwgYTIpIHtcbiAgICByZXR1cm4gYTFbMF0gPT09IGEyWzBdICYmIGExWzFdID09PSBhMlsxXSA/IHVuZGVmaW5lZCA6IGExO1xufVxuZnVuY3Rpb24gX2dldElmTkUzRChhMSwgYTIpIHtcbiAgICByZXR1cm4gYTFbMF0gPT09IGEyWzBdICYmIGExWzFdID09PSBhMlsxXSAmJiBhMVsyXSA9PT0gYTJbMl0gPyB1bmRlZmluZWQgOiBhMTtcbn1cbkZsb3dMYXlvdXROb2RlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoc2V0LCBkZWZhdWx0U2l6ZSkge1xuICAgIGlmIChkZWZhdWx0U2l6ZSkge1xuICAgICAgICB0aGlzLl9yZW1vdmluZyA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLl9pbnZhbGlkYXRlZCA9IHRydWU7XG4gICAgdGhpcy5zY3JvbGxMZW5ndGggPSBzZXQuc2Nyb2xsTGVuZ3RoO1xuICAgIHRoaXMuX3NwZWNNb2RpZmllZCA9IHRydWU7XG4gICAgdmFyIHByb3AgPSB0aGlzLl9wcm9wZXJ0aWVzLm9wYWNpdHk7XG4gICAgdmFyIHZhbHVlID0gc2V0Lm9wYWNpdHkgPT09IERFRkFVTFQub3BhY2l0eSA/IHVuZGVmaW5lZCA6IHNldC5vcGFjaXR5O1xuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkIHx8IHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIF9zZXRQcm9wZXJ0eVZhbHVlLmNhbGwodGhpcywgcHJvcCwgJ29wYWNpdHknLCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogW1xuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sIERFRkFVTFQub3BhY2l0eTJEKTtcbiAgICB9XG4gICAgcHJvcCA9IHRoaXMuX3Byb3BlcnRpZXMuYWxpZ247XG4gICAgdmFsdWUgPSBzZXQuYWxpZ24gPyBfZ2V0SWZORTJEKHNldC5hbGlnbiwgREVGQVVMVC5hbGlnbikgOiB1bmRlZmluZWQ7XG4gICAgaWYgKHZhbHVlIHx8IHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIF9zZXRQcm9wZXJ0eVZhbHVlLmNhbGwodGhpcywgcHJvcCwgJ2FsaWduJywgdmFsdWUsIERFRkFVTFQuYWxpZ24pO1xuICAgIH1cbiAgICBwcm9wID0gdGhpcy5fcHJvcGVydGllcy5vcmlnaW47XG4gICAgdmFsdWUgPSBzZXQub3JpZ2luID8gX2dldElmTkUyRChzZXQub3JpZ2luLCBERUZBVUxULm9yaWdpbikgOiB1bmRlZmluZWQ7XG4gICAgaWYgKHZhbHVlIHx8IHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIF9zZXRQcm9wZXJ0eVZhbHVlLmNhbGwodGhpcywgcHJvcCwgJ29yaWdpbicsIHZhbHVlLCBERUZBVUxULm9yaWdpbik7XG4gICAgfVxuICAgIHByb3AgPSB0aGlzLl9wcm9wZXJ0aWVzLnNpemU7XG4gICAgdmFsdWUgPSBzZXQuc2l6ZSB8fCBkZWZhdWx0U2l6ZTtcbiAgICBpZiAodmFsdWUgfHwgcHJvcCAmJiBwcm9wLmluaXQpIHtcbiAgICAgICAgX3NldFByb3BlcnR5VmFsdWUuY2FsbCh0aGlzLCBwcm9wLCAnc2l6ZScsIHZhbHVlLCBkZWZhdWx0U2l6ZSwgdGhpcy51c2VzVHJ1ZVNpemUpO1xuICAgIH1cbiAgICBwcm9wID0gdGhpcy5fcHJvcGVydGllcy50cmFuc2xhdGU7XG4gICAgdmFsdWUgPSBzZXQudHJhbnNsYXRlO1xuICAgIGlmICh2YWx1ZSB8fCBwcm9wICYmIHByb3AuaW5pdCkge1xuICAgICAgICBfc2V0UHJvcGVydHlWYWx1ZS5jYWxsKHRoaXMsIHByb3AsICd0cmFuc2xhdGUnLCB2YWx1ZSwgREVGQVVMVC50cmFuc2xhdGUsIHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgfVxuICAgIHByb3AgPSB0aGlzLl9wcm9wZXJ0aWVzLnNjYWxlO1xuICAgIHZhbHVlID0gc2V0LnNjYWxlID8gX2dldElmTkUzRChzZXQuc2NhbGUsIERFRkFVTFQuc2NhbGUpIDogdW5kZWZpbmVkO1xuICAgIGlmICh2YWx1ZSB8fCBwcm9wICYmIHByb3AuaW5pdCkge1xuICAgICAgICBfc2V0UHJvcGVydHlWYWx1ZS5jYWxsKHRoaXMsIHByb3AsICdzY2FsZScsIHZhbHVlLCBERUZBVUxULnNjYWxlKTtcbiAgICB9XG4gICAgcHJvcCA9IHRoaXMuX3Byb3BlcnRpZXMucm90YXRlO1xuICAgIHZhbHVlID0gc2V0LnJvdGF0ZSA/IF9nZXRJZk5FM0Qoc2V0LnJvdGF0ZSwgREVGQVVMVC5yb3RhdGUpIDogdW5kZWZpbmVkO1xuICAgIGlmICh2YWx1ZSB8fCBwcm9wICYmIHByb3AuaW5pdCkge1xuICAgICAgICBfc2V0UHJvcGVydHlWYWx1ZS5jYWxsKHRoaXMsIHByb3AsICdyb3RhdGUnLCB2YWx1ZSwgREVGQVVMVC5yb3RhdGUpO1xuICAgIH1cbiAgICBwcm9wID0gdGhpcy5fcHJvcGVydGllcy5za2V3O1xuICAgIHZhbHVlID0gc2V0LnNrZXcgPyBfZ2V0SWZORTNEKHNldC5za2V3LCBERUZBVUxULnNrZXcpIDogdW5kZWZpbmVkO1xuICAgIGlmICh2YWx1ZSB8fCBwcm9wICYmIHByb3AuaW5pdCkge1xuICAgICAgICBfc2V0UHJvcGVydHlWYWx1ZS5jYWxsKHRoaXMsIHByb3AsICdza2V3JywgdmFsdWUsIERFRkFVTFQuc2tldyk7XG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gRmxvd0xheW91dE5vZGU7IiwiZnVuY3Rpb24gTGF5b3V0Q29udGV4dChtZXRob2RzKSB7XG4gICAgZm9yICh2YXIgbiBpbiBtZXRob2RzKSB7XG4gICAgICAgIHRoaXNbbl0gPSBtZXRob2RzW25dO1xuICAgIH1cbn1cbkxheW91dENvbnRleHQucHJvdG90eXBlLnNpemUgPSB1bmRlZmluZWQ7XG5MYXlvdXRDb250ZXh0LnByb3RvdHlwZS5kaXJlY3Rpb24gPSB1bmRlZmluZWQ7XG5MYXlvdXRDb250ZXh0LnByb3RvdHlwZS5zY3JvbGxPZmZzZXQgPSB1bmRlZmluZWQ7XG5MYXlvdXRDb250ZXh0LnByb3RvdHlwZS5zY3JvbGxTdGFydCA9IHVuZGVmaW5lZDtcbkxheW91dENvbnRleHQucHJvdG90eXBlLnNjcm9sbEVuZCA9IHVuZGVmaW5lZDtcbkxheW91dENvbnRleHQucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAoKSB7XG59O1xuTGF5b3V0Q29udGV4dC5wcm90b3R5cGUucHJldiA9IGZ1bmN0aW9uICgpIHtcbn07XG5MYXlvdXRDb250ZXh0LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAobm9kZSkge1xufTtcbkxheW91dENvbnRleHQucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChub2RlLCBzZXQpIHtcbn07XG5MYXlvdXRDb250ZXh0LnByb3RvdHlwZS5yZXNvbHZlU2l6ZSA9IGZ1bmN0aW9uIChub2RlKSB7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBMYXlvdXRDb250ZXh0OyIsInZhciBVdGlsaXR5ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLnV0aWxpdGllcy5VdGlsaXR5IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnV0aWxpdGllcy5VdGlsaXR5IDogbnVsbDtcbnZhciBFbnRpdHkgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5FbnRpdHkgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5FbnRpdHkgOiBudWxsO1xudmFyIFZpZXdTZXF1ZW5jZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLlZpZXdTZXF1ZW5jZSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLlZpZXdTZXF1ZW5jZSA6IG51bGw7XG52YXIgT3B0aW9uc01hbmFnZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5PcHRpb25zTWFuYWdlciA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLk9wdGlvbnNNYW5hZ2VyIDogbnVsbDtcbnZhciBFdmVudEhhbmRsZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5FdmVudEhhbmRsZXIgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5FdmVudEhhbmRsZXIgOiBudWxsO1xudmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuL0xheW91dFV0aWxpdHknKTtcbnZhciBMYXlvdXROb2RlTWFuYWdlciA9IHJlcXVpcmUoJy4vTGF5b3V0Tm9kZU1hbmFnZXInKTtcbnZhciBMYXlvdXROb2RlID0gcmVxdWlyZSgnLi9MYXlvdXROb2RlJyk7XG52YXIgRmxvd0xheW91dE5vZGUgPSByZXF1aXJlKCcuL0Zsb3dMYXlvdXROb2RlJyk7XG52YXIgVHJhbnNmb3JtID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuVHJhbnNmb3JtIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuVHJhbnNmb3JtIDogbnVsbDtcbnJlcXVpcmUoJy4vaGVscGVycy9MYXlvdXREb2NrSGVscGVyJyk7XG5mdW5jdGlvbiBMYXlvdXRDb250cm9sbGVyKG9wdGlvbnMsIG5vZGVNYW5hZ2VyKSB7XG4gICAgdGhpcy5pZCA9IEVudGl0eS5yZWdpc3Rlcih0aGlzKTtcbiAgICB0aGlzLl9pc0RpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlID0gW1xuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXTtcbiAgICB0aGlzLl9jb21taXRPdXRwdXQgPSB7fTtcbiAgICB0aGlzLl9ldmVudElucHV0ID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIEV2ZW50SGFuZGxlci5zZXRJbnB1dEhhbmRsZXIodGhpcywgdGhpcy5fZXZlbnRJbnB1dCk7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcywgdGhpcy5fZXZlbnRPdXRwdXQpO1xuICAgIHRoaXMuX2xheW91dCA9IHsgb3B0aW9uczogT2JqZWN0LmNyZWF0ZSh7fSkgfTtcbiAgICB0aGlzLl9sYXlvdXQub3B0aW9uc01hbmFnZXIgPSBuZXcgT3B0aW9uc01hbmFnZXIodGhpcy5fbGF5b3V0Lm9wdGlvbnMpO1xuICAgIHRoaXMuX2xheW91dC5vcHRpb25zTWFuYWdlci5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9pc0RpcnR5ID0gdHJ1ZTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5jcmVhdGUoTGF5b3V0Q29udHJvbGxlci5ERUZBVUxUX09QVElPTlMpO1xuICAgIHRoaXMuX29wdGlvbnNNYW5hZ2VyID0gbmV3IE9wdGlvbnNNYW5hZ2VyKHRoaXMub3B0aW9ucyk7XG4gICAgaWYgKG5vZGVNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuX25vZGVzID0gbm9kZU1hbmFnZXI7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZmxvdykge1xuICAgICAgICB0aGlzLl9ub2RlcyA9IG5ldyBMYXlvdXROb2RlTWFuYWdlcihGbG93TGF5b3V0Tm9kZSwgX2luaXRGbG93TGF5b3V0Tm9kZS5iaW5kKHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9ub2RlcyA9IG5ldyBMYXlvdXROb2RlTWFuYWdlcihMYXlvdXROb2RlKTtcbiAgICB9XG4gICAgdGhpcy5zZXREaXJlY3Rpb24odW5kZWZpbmVkKTtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgfVxufVxuTGF5b3V0Q29udHJvbGxlci5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgbm9kZVNwcmluZzoge1xuICAgICAgICBkYW1waW5nUmF0aW86IDAuOCxcbiAgICAgICAgcGVyaW9kOiAzMDBcbiAgICB9LFxuICAgIHJlZmxvd09uUmVzaXplOiB0cnVlXG59O1xuZnVuY3Rpb24gX2luaXRGbG93TGF5b3V0Tm9kZShub2RlLCBzcGVjKSB7XG4gICAgaWYgKCFzcGVjICYmIHRoaXMub3B0aW9ucy5pbnNlcnRTcGVjKSB7XG4gICAgICAgIG5vZGUuc2V0U3BlYyh0aGlzLm9wdGlvbnMuaW5zZXJ0U3BlYyk7XG4gICAgfVxufVxuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmFsaWdubWVudCAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMuYWxpZ25tZW50ICE9PSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzLl9vcHRpb25zTWFuYWdlci5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIGlmIChvcHRpb25zLmRhdGFTb3VyY2UpIHtcbiAgICAgICAgdGhpcy5zZXREYXRhU291cmNlKG9wdGlvbnMuZGF0YVNvdXJjZSk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmxheW91dCkge1xuICAgICAgICB0aGlzLnNldExheW91dChvcHRpb25zLmxheW91dCwgb3B0aW9ucy5sYXlvdXRPcHRpb25zKTtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMubGF5b3V0T3B0aW9ucykge1xuICAgICAgICB0aGlzLnNldExheW91dE9wdGlvbnMob3B0aW9ucy5sYXlvdXRPcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZGlyZWN0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5zZXREaXJlY3Rpb24ob3B0aW9ucy5kaXJlY3Rpb24pO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5ub2RlU3ByaW5nICYmIHRoaXMub3B0aW9ucy5mbG93KSB7XG4gICAgICAgIHRoaXMuX25vZGVzLnNldE5vZGVPcHRpb25zKHsgc3ByaW5nOiBvcHRpb25zLm5vZGVTcHJpbmcgfSk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLnByZWFsbG9jYXRlTm9kZXMpIHtcbiAgICAgICAgdGhpcy5fbm9kZXMucHJlYWxsb2NhdGVOb2RlcyhvcHRpb25zLnByZWFsbG9jYXRlTm9kZXMuY291bnQgfHwgMCwgb3B0aW9ucy5wcmVhbGxvY2F0ZU5vZGVzLnNwZWMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5mdW5jdGlvbiBfZm9yRWFjaFJlbmRlcmFibGUoY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YVNvdXJjZSA9IHRoaXMuX2RhdGFTb3VyY2U7XG4gICAgaWYgKGRhdGFTb3VyY2UgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IGRhdGFTb3VyY2UubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhkYXRhU291cmNlW2ldKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZGF0YVNvdXJjZSBpbnN0YW5jZW9mIFZpZXdTZXF1ZW5jZSkge1xuICAgICAgICB2YXIgcmVuZGVyYWJsZTtcbiAgICAgICAgd2hpbGUgKGRhdGFTb3VyY2UpIHtcbiAgICAgICAgICAgIHJlbmRlcmFibGUgPSBkYXRhU291cmNlLmdldCgpO1xuICAgICAgICAgICAgaWYgKCFyZW5kZXJhYmxlKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjayhyZW5kZXJhYmxlKTtcbiAgICAgICAgICAgIGRhdGFTb3VyY2UgPSBkYXRhU291cmNlLmdldE5leHQoKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBkYXRhU291cmNlKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhkYXRhU291cmNlW2tleV0pO1xuICAgICAgICB9XG4gICAgfVxufVxuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUuc2V0RGF0YVNvdXJjZSA9IGZ1bmN0aW9uIChkYXRhU291cmNlKSB7XG4gICAgdGhpcy5fZGF0YVNvdXJjZSA9IGRhdGFTb3VyY2U7XG4gICAgdGhpcy5fbm9kZXNCeUlkID0gdW5kZWZpbmVkO1xuICAgIGlmIChkYXRhU291cmNlIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgdGhpcy5fdmlld1NlcXVlbmNlID0gbmV3IFZpZXdTZXF1ZW5jZShkYXRhU291cmNlKTtcbiAgICB9IGVsc2UgaWYgKGRhdGFTb3VyY2UgaW5zdGFuY2VvZiBWaWV3U2VxdWVuY2UgfHwgZGF0YVNvdXJjZS5nZXROZXh0KSB7XG4gICAgICAgIHRoaXMuX3ZpZXdTZXF1ZW5jZSA9IGRhdGFTb3VyY2U7XG4gICAgfSBlbHNlIGlmIChkYXRhU291cmNlIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgIHRoaXMuX25vZGVzQnlJZCA9IGRhdGFTb3VyY2U7XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b1BpcGVFdmVudHMpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RhdGFTb3VyY2UucGlwZSkge1xuICAgICAgICAgICAgdGhpcy5fZGF0YVNvdXJjZS5waXBlKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5fZGF0YVNvdXJjZS5waXBlKHRoaXMuX2V2ZW50T3V0cHV0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9mb3JFYWNoUmVuZGVyYWJsZS5jYWxsKHRoaXMsIGZ1bmN0aW9uIChyZW5kZXJhYmxlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlbmRlcmFibGUgJiYgcmVuZGVyYWJsZS5waXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmFibGUucGlwZSh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyYWJsZS5waXBlKHRoaXMuX2V2ZW50T3V0cHV0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmdldERhdGFTb3VyY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFTb3VyY2U7XG59O1xuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUuc2V0TGF5b3V0ID0gZnVuY3Rpb24gKGxheW91dCwgb3B0aW9ucykge1xuICAgIGlmIChsYXlvdXQgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgICB0aGlzLl9sYXlvdXQuX2Z1bmN0aW9uID0gbGF5b3V0O1xuICAgICAgICB0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzID0gbGF5b3V0LkNhcGFiaWxpdGllcztcbiAgICAgICAgdGhpcy5fbGF5b3V0LmxpdGVyYWwgPSB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIGlmIChsYXlvdXQgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgdGhpcy5fbGF5b3V0LmxpdGVyYWwgPSBsYXlvdXQ7XG4gICAgICAgIHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBoZWxwZXJOYW1lID0gT2JqZWN0LmtleXMobGF5b3V0KVswXTtcbiAgICAgICAgdmFyIEhlbHBlciA9IExheW91dFV0aWxpdHkuZ2V0UmVnaXN0ZXJlZEhlbHBlcihoZWxwZXJOYW1lKTtcbiAgICAgICAgdGhpcy5fbGF5b3V0Ll9mdW5jdGlvbiA9IEhlbHBlciA/IGZ1bmN0aW9uIChjb250ZXh0LCBvcHRpb25zMikge1xuICAgICAgICAgICAgdmFyIGhlbHBlciA9IG5ldyBIZWxwZXIoY29udGV4dCwgb3B0aW9uczIpO1xuICAgICAgICAgICAgaGVscGVyLnBhcnNlKGxheW91dFtoZWxwZXJOYW1lXSk7XG4gICAgICAgIH0gOiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbGF5b3V0Ll9mdW5jdGlvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fbGF5b3V0LmNhcGFiaWxpdGllcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fbGF5b3V0LmxpdGVyYWwgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuc2V0TGF5b3V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICB9XG4gICAgdGhpcy5zZXREaXJlY3Rpb24odGhpcy5fY29uZmlndXJlZERpcmVjdGlvbik7XG4gICAgdGhpcy5faXNEaXJ0eSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUuZ2V0TGF5b3V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9sYXlvdXQubGl0ZXJhbCB8fCB0aGlzLl9sYXlvdXQuX2Z1bmN0aW9uO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnNldExheW91dE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHRoaXMuX2xheW91dC5vcHRpb25zTWFuYWdlci5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmdldExheW91dE9wdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xheW91dC5vcHRpb25zO1xufTtcbmZ1bmN0aW9uIF9nZXRBY3R1YWxEaXJlY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgaWYgKHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMgJiYgdGhpcy5fbGF5b3V0LmNhcGFiaWxpdGllcy5kaXJlY3Rpb24pIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5fbGF5b3V0LmNhcGFiaWxpdGllcy5kaXJlY3Rpb24pKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMuZGlyZWN0aW9uLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMuZGlyZWN0aW9uW2ldID09PSBkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbGF5b3V0LmNhcGFiaWxpdGllcy5kaXJlY3Rpb25bMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbGF5b3V0LmNhcGFiaWxpdGllcy5kaXJlY3Rpb247XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRpcmVjdGlvbiA9PT0gdW5kZWZpbmVkID8gVXRpbGl0eS5EaXJlY3Rpb24uWSA6IGRpcmVjdGlvbjtcbn1cbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnNldERpcmVjdGlvbiA9IGZ1bmN0aW9uIChkaXJlY3Rpb24pIHtcbiAgICB0aGlzLl9jb25maWd1cmVkRGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIHZhciBuZXdEaXJlY3Rpb24gPSBfZ2V0QWN0dWFsRGlyZWN0aW9uLmNhbGwodGhpcywgZGlyZWN0aW9uKTtcbiAgICBpZiAobmV3RGlyZWN0aW9uICE9PSB0aGlzLl9kaXJlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5fZGlyZWN0aW9uID0gbmV3RGlyZWN0aW9uO1xuICAgICAgICB0aGlzLl9pc0RpcnR5ID0gdHJ1ZTtcbiAgICB9XG59O1xuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUuZ2V0RGlyZWN0aW9uID0gZnVuY3Rpb24gKGFjdHVhbCkge1xuICAgIHJldHVybiBhY3R1YWwgPyB0aGlzLl9kaXJlY3Rpb24gOiB0aGlzLl9jb25maWd1cmVkRGlyZWN0aW9uO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmdldFNwZWMgPSBmdW5jdGlvbiAobm9kZSwgbm9ybWFsaXplKSB7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChub2RlIGluc3RhbmNlb2YgU3RyaW5nIHx8IHR5cGVvZiBub2RlID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAoIXRoaXMuX25vZGVzQnlJZCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gdGhpcy5fbm9kZXNCeUlkW25vZGVdO1xuICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuX3NwZWNzKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fc3BlY3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzcGVjID0gdGhpcy5fc3BlY3NbaV07XG4gICAgICAgICAgICBpZiAoc3BlYy5yZW5kZXJOb2RlID09PSBub2RlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZSAmJiBzcGVjLnRyYW5zZm9ybSAmJiBzcGVjLnNpemUgJiYgKHNwZWMuYWxpZ24gfHwgc3BlYy5vcmlnaW4pKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc2Zvcm0gPSBzcGVjLnRyYW5zZm9ybTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNwZWMuYWxpZ24gJiYgKHNwZWMuYWxpZ25bMF0gfHwgc3BlYy5hbGlnblsxXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybSA9IFRyYW5zZm9ybS50aGVuTW92ZSh0cmFuc2Zvcm0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjLmFsaWduWzBdICogdGhpcy5fY29udGV4dFNpemVDYWNoZVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjLmFsaWduWzFdICogdGhpcy5fY29udGV4dFNpemVDYWNoZVsxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3BlYy5vcmlnaW4gJiYgKHNwZWMub3JpZ2luWzBdIHx8IHNwZWMub3JpZ2luWzFdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtID0gVHJhbnNmb3JtLm1vdmVUaGVuKFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAtc3BlYy5vcmlnaW5bMF0gKiBzcGVjLnNpemVbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLXNwZWMub3JpZ2luWzFdICogc3BlYy5zaXplWzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sIHRyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IHNwZWMub3BhY2l0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IHNwZWMuc2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNmb3JtXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBzcGVjO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59O1xuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUucmVmbG93TGF5b3V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmluc2VydCA9IGZ1bmN0aW9uIChpbmRleE9ySWQsIHJlbmRlcmFibGUsIGluc2VydFNwZWMpIHtcbiAgICBpZiAoaW5kZXhPcklkIGluc3RhbmNlb2YgU3RyaW5nIHx8IHR5cGVvZiBpbmRleE9ySWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmICh0aGlzLl9kYXRhU291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGFTb3VyY2UgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuX25vZGVzQnlJZCA9IHRoaXMuX2RhdGFTb3VyY2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbm9kZXNCeUlkW2luZGV4T3JJZF0gPSByZW5kZXJhYmxlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLl9kYXRhU291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGFTb3VyY2UgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdTZXF1ZW5jZSA9IG5ldyBWaWV3U2VxdWVuY2UodGhpcy5fZGF0YVNvdXJjZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRhdGFTb3VyY2UgPSB0aGlzLl92aWV3U2VxdWVuY2UgfHwgdGhpcy5fZGF0YVNvdXJjZTtcbiAgICAgICAgaWYgKGluZGV4T3JJZCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGRhdGFTb3VyY2UucHVzaChyZW5kZXJhYmxlKTtcbiAgICAgICAgfSBlbHNlIGlmIChpbmRleE9ySWQgPT09IDApIHtcbiAgICAgICAgICAgIGlmIChkYXRhU291cmNlID09PSB0aGlzLl92aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgICAgICBkYXRhU291cmNlLnNwbGljZSgwLCAwLCByZW5kZXJhYmxlKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fdmlld1NlcXVlbmNlLmdldEluZGV4KCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHRWaWV3U2VxdWVuY2UgPSB0aGlzLl92aWV3U2VxdWVuY2UuZ2V0TmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dFZpZXdTZXF1ZW5jZSAmJiBuZXh0Vmlld1NlcXVlbmNlLmdldCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl92aWV3U2VxdWVuY2UgPSBuZXh0Vmlld1NlcXVlbmNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkYXRhU291cmNlLnNwbGljZSgwLCAwLCByZW5kZXJhYmxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRhdGFTb3VyY2Uuc3BsaWNlKGluZGV4T3JJZCwgMCwgcmVuZGVyYWJsZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGluc2VydFNwZWMpIHtcbiAgICAgICAgdGhpcy5fbm9kZXMuaW5zZXJ0Tm9kZSh0aGlzLl9ub2Rlcy5jcmVhdGVOb2RlKHJlbmRlcmFibGUsIGluc2VydFNwZWMpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUGlwZUV2ZW50cyAmJiByZW5kZXJhYmxlICYmIHJlbmRlcmFibGUucGlwZSkge1xuICAgICAgICByZW5kZXJhYmxlLnBpcGUodGhpcyk7XG4gICAgICAgIHJlbmRlcmFibGUucGlwZSh0aGlzLl9ldmVudE91dHB1dCk7XG4gICAgfVxuICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAocmVuZGVyYWJsZSwgaW5zZXJ0U3BlYykge1xuICAgIHJldHVybiB0aGlzLmluc2VydCgtMSwgcmVuZGVyYWJsZSwgaW5zZXJ0U3BlYyk7XG59O1xuZnVuY3Rpb24gX2dldFZpZXdTZXF1ZW5jZUF0SW5kZXgoaW5kZXgpIHtcbiAgICB2YXIgdmlld1NlcXVlbmNlID0gdGhpcy5fdmlld1NlcXVlbmNlO1xuICAgIHZhciBpID0gdmlld1NlcXVlbmNlID8gdmlld1NlcXVlbmNlLmdldEluZGV4KCkgOiBpbmRleDtcbiAgICBpZiAoaW5kZXggPiBpKSB7XG4gICAgICAgIHdoaWxlICh2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgIHZpZXdTZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZS5nZXROZXh0KCk7XG4gICAgICAgICAgICBpZiAoIXZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpID0gdmlld1NlcXVlbmNlLmdldEluZGV4KCk7XG4gICAgICAgICAgICBpZiAoaSA9PT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlld1NlcXVlbmNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmRleCA8IGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChpbmRleCA8IGkpIHtcbiAgICAgICAgd2hpbGUgKHZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgdmlld1NlcXVlbmNlID0gdmlld1NlcXVlbmNlLmdldFByZXZpb3VzKCk7XG4gICAgICAgICAgICBpZiAoIXZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpID0gdmlld1NlcXVlbmNlLmdldEluZGV4KCk7XG4gICAgICAgICAgICBpZiAoaSA9PT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlld1NlcXVlbmNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmRleCA+IGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2aWV3U2VxdWVuY2U7XG59XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5zd2FwID0gZnVuY3Rpb24gKGluZGV4LCBpbmRleDIpIHtcbiAgICBpZiAodGhpcy5fdmlld1NlcXVlbmNlKSB7XG4gICAgICAgIF9nZXRWaWV3U2VxdWVuY2VBdEluZGV4LmNhbGwodGhpcywgaW5kZXgpLnN3YXAoX2dldFZpZXdTZXF1ZW5jZUF0SW5kZXguY2FsbCh0aGlzLCBpbmRleDIpKTtcbiAgICAgICAgdGhpcy5faXNEaXJ0eSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChpbmRleE9ySWQsIHJlbW92ZVNwZWMpIHtcbiAgICB2YXIgcmVuZGVyTm9kZTtcbiAgICBpZiAodGhpcy5fbm9kZXNCeUlkIHx8IGluZGV4T3JJZCBpbnN0YW5jZW9mIFN0cmluZyB8fCB0eXBlb2YgaW5kZXhPcklkID09PSAnc3RyaW5nJykge1xuICAgICAgICByZW5kZXJOb2RlID0gdGhpcy5fbm9kZXNCeUlkW2luZGV4T3JJZF07XG4gICAgICAgIGlmIChyZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fbm9kZXNCeUlkW2luZGV4T3JJZF07XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICByZW5kZXJOb2RlID0gdGhpcy5fZGF0YVNvdXJjZS5zcGxpY2UoaW5kZXhPcklkLCAxKVswXTtcbiAgICB9XG4gICAgaWYgKHJlbmRlck5vZGUgJiYgcmVtb3ZlU3BlYykge1xuICAgICAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldE5vZGVCeVJlbmRlck5vZGUocmVuZGVyTm9kZSk7XG4gICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICBub2RlLnJlbW92ZShyZW1vdmVTcGVjIHx8IHRoaXMub3B0aW9ucy5yZW1vdmVTcGVjKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocmVuZGVyTm9kZSkge1xuICAgICAgICB0aGlzLl9pc0RpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUucmVtb3ZlQWxsID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9ub2Rlc0J5SWQpIHtcbiAgICAgICAgdmFyIGRpcnR5ID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLl9ub2Rlc0J5SWQpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9ub2Rlc0J5SWRba2V5XTtcbiAgICAgICAgICAgIGRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGlydHkpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLl9kYXRhU291cmNlKSB7XG4gICAgICAgIHRoaXMuc2V0RGF0YVNvdXJjZShbXSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmdldFNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NpemUgfHwgdGhpcy5vcHRpb25zLnNpemU7XG59O1xuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHJldHVybiB0aGlzLmlkO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmNvbW1pdCA9IGZ1bmN0aW9uIGNvbW1pdChjb250ZXh0KSB7XG4gICAgdmFyIHRyYW5zZm9ybSA9IGNvbnRleHQudHJhbnNmb3JtO1xuICAgIHZhciBvcmlnaW4gPSBjb250ZXh0Lm9yaWdpbjtcbiAgICB2YXIgc2l6ZSA9IGNvbnRleHQuc2l6ZTtcbiAgICB2YXIgb3BhY2l0eSA9IGNvbnRleHQub3BhY2l0eTtcbiAgICBpZiAoc2l6ZVswXSAhPT0gdGhpcy5fY29udGV4dFNpemVDYWNoZVswXSB8fCBzaXplWzFdICE9PSB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlWzFdIHx8IHRoaXMuX2lzRGlydHkgfHwgdGhpcy5fbm9kZXMuX3RydWVTaXplUmVxdWVzdGVkIHx8IHRoaXMub3B0aW9ucy5hbHdheXNMYXlvdXQpIHtcbiAgICAgICAgdmFyIGV2ZW50RGF0YSA9IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICAgICAgICAgICAgb2xkU2l6ZTogdGhpcy5fY29udGV4dFNpemVDYWNoZSxcbiAgICAgICAgICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICAgICAgICAgIGRpcnR5OiB0aGlzLl9pc0RpcnR5LFxuICAgICAgICAgICAgICAgIHRydWVTaXplUmVxdWVzdGVkOiB0aGlzLl9ub2Rlcy5fdHJ1ZVNpemVSZXF1ZXN0ZWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ2xheW91dHN0YXJ0JywgZXZlbnREYXRhKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5mbG93ICYmICh0aGlzLl9pc0RpcnR5IHx8IHRoaXMub3B0aW9ucy5yZWZsb3dPblJlc2l6ZSAmJiAoc2l6ZVswXSAhPT0gdGhpcy5fY29udGV4dFNpemVDYWNoZVswXSB8fCBzaXplWzFdICE9PSB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlWzFdKSkpIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5fbm9kZXMuZ2V0U3RhcnRFbnVtTm9kZSgpO1xuICAgICAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBub2RlLnJlbGVhc2VMb2NrKCk7XG4gICAgICAgICAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY29udGV4dFNpemVDYWNoZVswXSA9IHNpemVbMF07XG4gICAgICAgIHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbMV0gPSBzaXplWzFdO1xuICAgICAgICB0aGlzLl9pc0RpcnR5ID0gZmFsc2U7XG4gICAgICAgIHZhciBzY3JvbGxFbmQ7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2l6ZSAmJiB0aGlzLm9wdGlvbnMuc2l6ZVt0aGlzLl9kaXJlY3Rpb25dID09PSB0cnVlKSB7XG4gICAgICAgICAgICBzY3JvbGxFbmQgPSAxMDAwMDAwO1xuICAgICAgICB9XG4gICAgICAgIHZhciBsYXlvdXRDb250ZXh0ID0gdGhpcy5fbm9kZXMucHJlcGFyZUZvckxheW91dCh0aGlzLl92aWV3U2VxdWVuY2UsIHRoaXMuX25vZGVzQnlJZCwge1xuICAgICAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiB0aGlzLl9kaXJlY3Rpb24sXG4gICAgICAgICAgICAgICAgc2Nyb2xsRW5kOiBzY3JvbGxFbmRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5fbGF5b3V0Ll9mdW5jdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fbGF5b3V0Ll9mdW5jdGlvbihsYXlvdXRDb250ZXh0LCB0aGlzLl9sYXlvdXQub3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbm9kZXMucmVtb3ZlVmlydHVhbFZpZXdTZXF1ZW5jZU5vZGVzKCk7XG4gICAgICAgIGlmIChzY3JvbGxFbmQpIHtcbiAgICAgICAgICAgIHNjcm9sbEVuZCA9IDA7XG4gICAgICAgICAgICBub2RlID0gdGhpcy5fbm9kZXMuZ2V0U3RhcnRFbnVtTm9kZSgpO1xuICAgICAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5faW52YWxpZGF0ZWQgJiYgbm9kZS5zY3JvbGxMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRW5kICs9IG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3NpemUgPSB0aGlzLl9zaXplIHx8IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICB0aGlzLl9zaXplWzBdID0gdGhpcy5vcHRpb25zLnNpemVbMF07XG4gICAgICAgICAgICB0aGlzLl9zaXplWzFdID0gdGhpcy5vcHRpb25zLnNpemVbMV07XG4gICAgICAgICAgICB0aGlzLl9zaXplW3RoaXMuX2RpcmVjdGlvbl0gPSBzY3JvbGxFbmQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX25vZGVzLmJ1aWxkU3BlY0FuZERlc3Ryb3lVbnJlbmRlcmVkTm9kZXMoKTtcbiAgICAgICAgdGhpcy5fY29tbWl0T3V0cHV0LnRhcmdldCA9IHJlc3VsdC5zcGVjcztcbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgncmVmbG93JywgeyB0YXJnZXQ6IHRoaXMgfSk7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ2xheW91dGVuZCcsIGV2ZW50RGF0YSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZmxvdykge1xuICAgICAgICByZXN1bHQgPSB0aGlzLl9ub2Rlcy5idWlsZFNwZWNBbmREZXN0cm95VW5yZW5kZXJlZE5vZGVzKCk7XG4gICAgICAgIHRoaXMuX2NvbW1pdE91dHB1dC50YXJnZXQgPSByZXN1bHQuc3BlY3M7XG4gICAgICAgIGlmIChyZXN1bHQubW9kaWZpZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3JlZmxvdycsIHsgdGFyZ2V0OiB0aGlzIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3NwZWNzID0gdGhpcy5fY29tbWl0T3V0cHV0LnRhcmdldDtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5fY29tbWl0T3V0cHV0LnRhcmdldDtcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHRhcmdldC5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgdGFyZ2V0W2ldLnRhcmdldCA9IHRhcmdldFtpXS5yZW5kZXJOb2RlLnJlbmRlcigpO1xuICAgIH1cbiAgICBpZiAob3JpZ2luICYmIChvcmlnaW5bMF0gIT09IDAgfHwgb3JpZ2luWzFdICE9PSAwKSkge1xuICAgICAgICB0cmFuc2Zvcm0gPSBUcmFuc2Zvcm0ubW92ZVRoZW4oW1xuICAgICAgICAgICAgLXNpemVbMF0gKiBvcmlnaW5bMF0sXG4gICAgICAgICAgICAtc2l6ZVsxXSAqIG9yaWdpblsxXSxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSwgdHJhbnNmb3JtKTtcbiAgICB9XG4gICAgdGhpcy5fY29tbWl0T3V0cHV0LnNpemUgPSBzaXplO1xuICAgIHRoaXMuX2NvbW1pdE91dHB1dC5vcGFjaXR5ID0gb3BhY2l0eTtcbiAgICB0aGlzLl9jb21taXRPdXRwdXQudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICAgIHJldHVybiB0aGlzLl9jb21taXRPdXRwdXQ7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBMYXlvdXRDb250cm9sbGVyOyIsInZhciBUcmFuc2Zvcm0gPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5UcmFuc2Zvcm0gOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5UcmFuc2Zvcm0gOiBudWxsO1xudmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuL0xheW91dFV0aWxpdHknKTtcbmZ1bmN0aW9uIExheW91dE5vZGUocmVuZGVyTm9kZSwgc3BlYykge1xuICAgIHRoaXMucmVuZGVyTm9kZSA9IHJlbmRlck5vZGU7XG4gICAgdGhpcy5fc3BlYyA9IHNwZWMgPyBMYXlvdXRVdGlsaXR5LmNsb25lU3BlYyhzcGVjKSA6IHt9O1xuICAgIHRoaXMuX3NwZWMucmVuZGVyTm9kZSA9IHJlbmRlck5vZGU7XG4gICAgdGhpcy5fc3BlY01vZGlmaWVkID0gdHJ1ZTtcbiAgICB0aGlzLl9pbnZhbGlkYXRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3JlbW92aW5nID0gZmFsc2U7XG59XG5MYXlvdXROb2RlLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbn07XG5MYXlvdXROb2RlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucmVuZGVyTm9kZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9zcGVjLnJlbmRlck5vZGUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fdmlld1NlcXVlbmNlID0gdW5kZWZpbmVkO1xufTtcbkxheW91dE5vZGUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2ludmFsaWRhdGVkID0gZmFsc2U7XG4gICAgdGhpcy50cnVlU2l6ZVJlcXVlc3RlZCA9IGZhbHNlO1xufTtcbkxheW91dE5vZGUucHJvdG90eXBlLnNldFNwZWMgPSBmdW5jdGlvbiAoc3BlYykge1xuICAgIHRoaXMuX3NwZWNNb2RpZmllZCA9IHRydWU7XG4gICAgaWYgKHNwZWMuYWxpZ24pIHtcbiAgICAgICAgaWYgKCFzcGVjLmFsaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9zcGVjLmFsaWduID0gW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zcGVjLmFsaWduWzBdID0gc3BlYy5hbGlnblswXTtcbiAgICAgICAgdGhpcy5fc3BlYy5hbGlnblsxXSA9IHNwZWMuYWxpZ25bMV07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc3BlYy5hbGlnbiA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHNwZWMub3JpZ2luKSB7XG4gICAgICAgIGlmICghc3BlYy5vcmlnaW4pIHtcbiAgICAgICAgICAgIHRoaXMuX3NwZWMub3JpZ2luID0gW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zcGVjLm9yaWdpblswXSA9IHNwZWMub3JpZ2luWzBdO1xuICAgICAgICB0aGlzLl9zcGVjLm9yaWdpblsxXSA9IHNwZWMub3JpZ2luWzFdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NwZWMub3JpZ2luID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoc3BlYy5zaXplKSB7XG4gICAgICAgIGlmICghc3BlYy5zaXplKSB7XG4gICAgICAgICAgICB0aGlzLl9zcGVjLnNpemUgPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NwZWMuc2l6ZVswXSA9IHNwZWMuc2l6ZVswXTtcbiAgICAgICAgdGhpcy5fc3BlYy5zaXplWzFdID0gc3BlYy5zaXplWzFdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NwZWMuc2l6ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHNwZWMudHJhbnNmb3JtKSB7XG4gICAgICAgIGlmICghc3BlYy50cmFuc2Zvcm0pIHtcbiAgICAgICAgICAgIHRoaXMuX3NwZWMudHJhbnNmb3JtID0gc3BlYy50cmFuc2Zvcm0uc2xpY2UoMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE2OyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zcGVjLnRyYW5zZm9ybVswXSA9IHNwZWMudHJhbnNmb3JtWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc3BlYy50cmFuc2Zvcm0gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRoaXMuX3NwZWMub3BhY2l0eSA9IHNwZWMub3BhY2l0eTtcbn07XG5MYXlvdXROb2RlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoc2V0LCBzaXplKSB7XG4gICAgdGhpcy5faW52YWxpZGF0ZWQgPSB0cnVlO1xuICAgIHRoaXMuX3NwZWNNb2RpZmllZCA9IHRydWU7XG4gICAgdGhpcy5fcmVtb3ZpbmcgPSBmYWxzZTtcbiAgICB2YXIgc3BlYyA9IHRoaXMuX3NwZWM7XG4gICAgc3BlYy5vcGFjaXR5ID0gc2V0Lm9wYWNpdHk7XG4gICAgaWYgKHNldC5zaXplKSB7XG4gICAgICAgIGlmICghc3BlYy5zaXplKSB7XG4gICAgICAgICAgICBzcGVjLnNpemUgPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgICAgIHNwZWMuc2l6ZVswXSA9IHNldC5zaXplWzBdO1xuICAgICAgICBzcGVjLnNpemVbMV0gPSBzZXQuc2l6ZVsxXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzcGVjLnNpemUgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChzZXQub3JpZ2luKSB7XG4gICAgICAgIGlmICghc3BlYy5vcmlnaW4pIHtcbiAgICAgICAgICAgIHNwZWMub3JpZ2luID0gW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgICAgICBzcGVjLm9yaWdpblswXSA9IHNldC5vcmlnaW5bMF07XG4gICAgICAgIHNwZWMub3JpZ2luWzFdID0gc2V0Lm9yaWdpblsxXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzcGVjLm9yaWdpbiA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHNldC5hbGlnbikge1xuICAgICAgICBpZiAoIXNwZWMuYWxpZ24pIHtcbiAgICAgICAgICAgIHNwZWMuYWxpZ24gPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgICAgIHNwZWMuYWxpZ25bMF0gPSBzZXQuYWxpZ25bMF07XG4gICAgICAgIHNwZWMuYWxpZ25bMV0gPSBzZXQuYWxpZ25bMV07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3BlYy5hbGlnbiA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHNldC5za2V3IHx8IHNldC5yb3RhdGUgfHwgc2V0LnNjYWxlKSB7XG4gICAgICAgIHRoaXMuX3NwZWMudHJhbnNmb3JtID0gVHJhbnNmb3JtLmJ1aWxkKHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZTogc2V0LnRyYW5zbGF0ZSB8fCBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBza2V3OiBzZXQuc2tldyB8fCBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBzY2FsZTogc2V0LnNjYWxlIHx8IFtcbiAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHJvdGF0ZTogc2V0LnJvdGF0ZSB8fCBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChzZXQudHJhbnNsYXRlKSB7XG4gICAgICAgIHRoaXMuX3NwZWMudHJhbnNmb3JtID0gVHJhbnNmb3JtLnRyYW5zbGF0ZShzZXQudHJhbnNsYXRlWzBdLCBzZXQudHJhbnNsYXRlWzFdLCBzZXQudHJhbnNsYXRlWzJdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zcGVjLnRyYW5zZm9ybSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpcy5zY3JvbGxMZW5ndGggPSBzZXQuc2Nyb2xsTGVuZ3RoO1xufTtcbkxheW91dE5vZGUucHJvdG90eXBlLmdldFNwZWMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fc3BlY01vZGlmaWVkID0gZmFsc2U7XG4gICAgdGhpcy5fc3BlYy5yZW1vdmVkID0gIXRoaXMuX2ludmFsaWRhdGVkO1xuICAgIHJldHVybiB0aGlzLl9zcGVjO1xufTtcbkxheW91dE5vZGUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChyZW1vdmVTcGVjKSB7XG4gICAgdGhpcy5fcmVtb3ZpbmcgPSB0cnVlO1xufTtcbm1vZHVsZS5leHBvcnRzID0gTGF5b3V0Tm9kZTsiLCJ2YXIgTGF5b3V0Q29udGV4dCA9IHJlcXVpcmUoJy4vTGF5b3V0Q29udGV4dCcpO1xudmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuL0xheW91dFV0aWxpdHknKTtcbnZhciBNQVhfUE9PTF9TSVpFID0gMTAwO1xuZnVuY3Rpb24gTGF5b3V0Tm9kZU1hbmFnZXIoTGF5b3V0Tm9kZSwgaW5pdExheW91dE5vZGVGbikge1xuICAgIHRoaXMuTGF5b3V0Tm9kZSA9IExheW91dE5vZGU7XG4gICAgdGhpcy5faW5pdExheW91dE5vZGVGbiA9IGluaXRMYXlvdXROb2RlRm47XG4gICAgdGhpcy5fbGF5b3V0Q291bnQgPSAwO1xuICAgIHRoaXMuX2NvbnRleHQgPSBuZXcgTGF5b3V0Q29udGV4dCh7XG4gICAgICAgIG5leHQ6IF9jb250ZXh0TmV4dC5iaW5kKHRoaXMpLFxuICAgICAgICBwcmV2OiBfY29udGV4dFByZXYuYmluZCh0aGlzKSxcbiAgICAgICAgZ2V0OiBfY29udGV4dEdldC5iaW5kKHRoaXMpLFxuICAgICAgICBzZXQ6IF9jb250ZXh0U2V0LmJpbmQodGhpcyksXG4gICAgICAgIHJlc29sdmVTaXplOiBfY29udGV4dFJlc29sdmVTaXplLmJpbmQodGhpcyksXG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF1cbiAgICB9KTtcbiAgICB0aGlzLl9jb250ZXh0U3RhdGUgPSB7fTtcbiAgICB0aGlzLl9wb29sID0ge1xuICAgICAgICBsYXlvdXROb2RlczogeyBzaXplOiAwIH0sXG4gICAgICAgIHJlc29sdmVTaXplOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdXG4gICAgfTtcbn1cbkxheW91dE5vZGVNYW5hZ2VyLnByb3RvdHlwZS5wcmVwYXJlRm9yTGF5b3V0ID0gZnVuY3Rpb24gKHZpZXdTZXF1ZW5jZSwgbm9kZXNCeUlkLCBjb250ZXh0RGF0YSkge1xuICAgIHZhciBub2RlID0gdGhpcy5fZmlyc3Q7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgbm9kZS5yZXNldCgpO1xuICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICB9XG4gICAgdmFyIGNvbnRleHQgPSB0aGlzLl9jb250ZXh0O1xuICAgIHRoaXMuX2xheW91dENvdW50Kys7XG4gICAgdGhpcy5fbm9kZXNCeUlkID0gbm9kZXNCeUlkO1xuICAgIHRoaXMuX3RydWVTaXplUmVxdWVzdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fcmVldmFsVHJ1ZVNpemUgPSBjb250ZXh0RGF0YS5yZWV2YWxUcnVlU2l6ZSB8fCAhY29udGV4dC5zaXplIHx8IGNvbnRleHQuc2l6ZVswXSAhPT0gY29udGV4dERhdGEuc2l6ZVswXSB8fCBjb250ZXh0LnNpemVbMV0gIT09IGNvbnRleHREYXRhLnNpemVbMV07XG4gICAgdmFyIGNvbnRleHRTdGF0ZSA9IHRoaXMuX2NvbnRleHRTdGF0ZTtcbiAgICBjb250ZXh0U3RhdGUuc3RhcnRTZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZTtcbiAgICBjb250ZXh0U3RhdGUubmV4dFNlcXVlbmNlID0gdmlld1NlcXVlbmNlO1xuICAgIGNvbnRleHRTdGF0ZS5wcmV2U2VxdWVuY2UgPSB2aWV3U2VxdWVuY2U7XG4gICAgY29udGV4dFN0YXRlLnN0YXJ0ID0gdW5kZWZpbmVkO1xuICAgIGNvbnRleHRTdGF0ZS5uZXh0R2V0SW5kZXggPSAwO1xuICAgIGNvbnRleHRTdGF0ZS5wcmV2R2V0SW5kZXggPSAwO1xuICAgIGNvbnRleHRTdGF0ZS5uZXh0U2V0SW5kZXggPSAwO1xuICAgIGNvbnRleHRTdGF0ZS5wcmV2U2V0SW5kZXggPSAwO1xuICAgIGNvbnRleHRTdGF0ZS5hZGRDb3VudCA9IDA7XG4gICAgY29udGV4dFN0YXRlLnJlbW92ZUNvdW50ID0gMDtcbiAgICBjb250ZXh0LnNpemVbMF0gPSBjb250ZXh0RGF0YS5zaXplWzBdO1xuICAgIGNvbnRleHQuc2l6ZVsxXSA9IGNvbnRleHREYXRhLnNpemVbMV07XG4gICAgY29udGV4dC5kaXJlY3Rpb24gPSBjb250ZXh0RGF0YS5kaXJlY3Rpb247XG4gICAgY29udGV4dC5yZXZlcnNlID0gY29udGV4dERhdGEucmV2ZXJzZTtcbiAgICBjb250ZXh0LmFsaWdubWVudCA9IGNvbnRleHREYXRhLnJldmVyc2UgPyAxIDogMDtcbiAgICBjb250ZXh0LnNjcm9sbE9mZnNldCA9IGNvbnRleHREYXRhLnNjcm9sbE9mZnNldCB8fCAwO1xuICAgIGNvbnRleHQuc2Nyb2xsU3RhcnQgPSBjb250ZXh0RGF0YS5zY3JvbGxTdGFydCB8fCAwO1xuICAgIGNvbnRleHQuc2Nyb2xsRW5kID0gY29udGV4dERhdGEuc2Nyb2xsRW5kIHx8IGNvbnRleHQuc2l6ZVtjb250ZXh0LmRpcmVjdGlvbl07XG4gICAgcmV0dXJuIGNvbnRleHQ7XG59O1xuTGF5b3V0Tm9kZU1hbmFnZXIucHJvdG90eXBlLnJlbW92ZU5vbkludmFsaWRhdGVkTm9kZXMgPSBmdW5jdGlvbiAocmVtb3ZlU3BlYykge1xuICAgIHZhciBub2RlID0gdGhpcy5fZmlyc3Q7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKCFub2RlLl9pbnZhbGlkYXRlZCAmJiAhbm9kZS5fcmVtb3ZpbmcpIHtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlKHJlbW92ZVNwZWMpO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgIH1cbn07XG5MYXlvdXROb2RlTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlVmlydHVhbFZpZXdTZXF1ZW5jZU5vZGVzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnRTZXF1ZW5jZSAmJiB0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnRTZXF1ZW5jZS5jbGVhbnVwKSB7XG4gICAgICAgIHRoaXMuX2NvbnRleHRTdGF0ZS5zdGFydFNlcXVlbmNlLmNsZWFudXAoKTtcbiAgICB9XG59O1xuTGF5b3V0Tm9kZU1hbmFnZXIucHJvdG90eXBlLmJ1aWxkU3BlY0FuZERlc3Ryb3lVbnJlbmRlcmVkTm9kZXMgPSBmdW5jdGlvbiAodHJhbnNsYXRlKSB7XG4gICAgdmFyIHNwZWNzID0gW107XG4gICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHNwZWNzOiBzcGVjcyxcbiAgICAgICAgICAgIG1vZGlmaWVkOiBmYWxzZVxuICAgICAgICB9O1xuICAgIHZhciBub2RlID0gdGhpcy5fZmlyc3Q7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgdmFyIG1vZGlmaWVkID0gbm9kZS5fc3BlY01vZGlmaWVkO1xuICAgICAgICB2YXIgc3BlYyA9IG5vZGUuZ2V0U3BlYygpO1xuICAgICAgICBpZiAoc3BlYy5yZW1vdmVkKSB7XG4gICAgICAgICAgICB2YXIgZGVzdHJveU5vZGUgPSBub2RlO1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICAgICAgICBfZGVzdHJveU5vZGUuY2FsbCh0aGlzLCBkZXN0cm95Tm9kZSk7XG4gICAgICAgICAgICByZXN1bHQubW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNwZWMudHJhbnNmb3JtICYmIHRyYW5zbGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBzcGVjLnRyYW5zZm9ybVsxMl0gKz0gdHJhbnNsYXRlWzBdO1xuICAgICAgICAgICAgICAgICAgICBzcGVjLnRyYW5zZm9ybVsxM10gKz0gdHJhbnNsYXRlWzFdO1xuICAgICAgICAgICAgICAgICAgICBzcGVjLnRyYW5zZm9ybVsxNF0gKz0gdHJhbnNsYXRlWzJdO1xuICAgICAgICAgICAgICAgICAgICBzcGVjLnRyYW5zZm9ybVsxMl0gPSBNYXRoLnJvdW5kKHNwZWMudHJhbnNmb3JtWzEyXSAqIDEwMDAwMCkgLyAxMDAwMDA7XG4gICAgICAgICAgICAgICAgICAgIHNwZWMudHJhbnNmb3JtWzEzXSA9IE1hdGgucm91bmQoc3BlYy50cmFuc2Zvcm1bMTNdICogMTAwMDAwKSAvIDEwMDAwMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0Lm1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNwZWNzLnB1c2goc3BlYyk7XG4gICAgICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9jb250ZXh0U3RhdGUuYWRkQ291bnQgPSAwO1xuICAgIHRoaXMuX2NvbnRleHRTdGF0ZS5yZW1vdmVDb3VudCA9IDA7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5MYXlvdXROb2RlTWFuYWdlci5wcm90b3R5cGUuZ2V0Tm9kZUJ5UmVuZGVyTm9kZSA9IGZ1bmN0aW9uIChyZW5kZXJhYmxlKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLl9maXJzdDtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBpZiAobm9kZS5yZW5kZXJOb2RlID09PSByZW5kZXJhYmxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5MYXlvdXROb2RlTWFuYWdlci5wcm90b3R5cGUuaW5zZXJ0Tm9kZSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgbm9kZS5fbmV4dCA9IHRoaXMuX2ZpcnN0O1xuICAgIGlmICh0aGlzLl9maXJzdCkge1xuICAgICAgICB0aGlzLl9maXJzdC5fcHJldiA9IG5vZGU7XG4gICAgfVxuICAgIHRoaXMuX2ZpcnN0ID0gbm9kZTtcbn07XG5MYXlvdXROb2RlTWFuYWdlci5wcm90b3R5cGUuc2V0Tm9kZU9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHRoaXMuX25vZGVPcHRpb25zID0gb3B0aW9ucztcbiAgICB2YXIgbm9kZSA9IHRoaXMuX2ZpcnN0O1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIG5vZGUuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgfVxuICAgIG5vZGUgPSB0aGlzLl9wb29sLmxheW91dE5vZGVzLmZpcnN0O1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIG5vZGUuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgfVxufTtcbkxheW91dE5vZGVNYW5hZ2VyLnByb3RvdHlwZS5wcmVhbGxvY2F0ZU5vZGVzID0gZnVuY3Rpb24gKGNvdW50LCBzcGVjKSB7XG4gICAgdmFyIG5vZGVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgIG5vZGVzLnB1c2godGhpcy5jcmVhdGVOb2RlKHVuZGVmaW5lZCwgc3BlYykpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICBfZGVzdHJveU5vZGUuY2FsbCh0aGlzLCBub2Rlc1tpXSk7XG4gICAgfVxufTtcbkxheW91dE5vZGVNYW5hZ2VyLnByb3RvdHlwZS5jcmVhdGVOb2RlID0gZnVuY3Rpb24gKHJlbmRlck5vZGUsIHNwZWMpIHtcbiAgICB2YXIgbm9kZTtcbiAgICBpZiAodGhpcy5fcG9vbC5sYXlvdXROb2Rlcy5maXJzdCkge1xuICAgICAgICBub2RlID0gdGhpcy5fcG9vbC5sYXlvdXROb2Rlcy5maXJzdDtcbiAgICAgICAgdGhpcy5fcG9vbC5sYXlvdXROb2Rlcy5maXJzdCA9IG5vZGUuX25leHQ7XG4gICAgICAgIHRoaXMuX3Bvb2wubGF5b3V0Tm9kZXMuc2l6ZS0tO1xuICAgICAgICBub2RlLmNvbnN0cnVjdG9yLmFwcGx5KG5vZGUsIGFyZ3VtZW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZSA9IG5ldyB0aGlzLkxheW91dE5vZGUocmVuZGVyTm9kZSwgc3BlYyk7XG4gICAgICAgIGlmICh0aGlzLl9ub2RlT3B0aW9ucykge1xuICAgICAgICAgICAgbm9kZS5zZXRPcHRpb25zKHRoaXMuX25vZGVPcHRpb25zKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBub2RlLl9wcmV2ID0gdW5kZWZpbmVkO1xuICAgIG5vZGUuX25leHQgPSB1bmRlZmluZWQ7XG4gICAgbm9kZS5fdmlld1NlcXVlbmNlID0gdW5kZWZpbmVkO1xuICAgIG5vZGUuX2xheW91dENvdW50ID0gMDtcbiAgICBpZiAodGhpcy5faW5pdExheW91dE5vZGVGbikge1xuICAgICAgICB0aGlzLl9pbml0TGF5b3V0Tm9kZUZuLmNhbGwodGhpcywgbm9kZSwgc3BlYyk7XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xufTtcbmZ1bmN0aW9uIF9kZXN0cm95Tm9kZShub2RlKSB7XG4gICAgaWYgKG5vZGUuX25leHQpIHtcbiAgICAgICAgbm9kZS5fbmV4dC5fcHJldiA9IG5vZGUuX3ByZXY7XG4gICAgfVxuICAgIGlmIChub2RlLl9wcmV2KSB7XG4gICAgICAgIG5vZGUuX3ByZXYuX25leHQgPSBub2RlLl9uZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2ZpcnN0ID0gbm9kZS5fbmV4dDtcbiAgICB9XG4gICAgbm9kZS5kZXN0cm95KCk7XG4gICAgaWYgKHRoaXMuX3Bvb2wubGF5b3V0Tm9kZXMuc2l6ZSA8IE1BWF9QT09MX1NJWkUpIHtcbiAgICAgICAgdGhpcy5fcG9vbC5sYXlvdXROb2Rlcy5zaXplKys7XG4gICAgICAgIG5vZGUuX3ByZXYgPSB1bmRlZmluZWQ7XG4gICAgICAgIG5vZGUuX25leHQgPSB0aGlzLl9wb29sLmxheW91dE5vZGVzLmZpcnN0O1xuICAgICAgICB0aGlzLl9wb29sLmxheW91dE5vZGVzLmZpcnN0ID0gbm9kZTtcbiAgICB9XG59XG5MYXlvdXROb2RlTWFuYWdlci5wcm90b3R5cGUuZ2V0U3RhcnRFbnVtTm9kZSA9IGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgaWYgKG5leHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmlyc3Q7XG4gICAgfSBlbHNlIGlmIChuZXh0ID09PSB0cnVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnQgJiYgdGhpcy5fY29udGV4dFN0YXRlLnN0YXJ0UHJldiA/IHRoaXMuX2NvbnRleHRTdGF0ZS5zdGFydC5fbmV4dCA6IHRoaXMuX2NvbnRleHRTdGF0ZS5zdGFydDtcbiAgICB9IGVsc2UgaWYgKG5leHQgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnQgJiYgIXRoaXMuX2NvbnRleHRTdGF0ZS5zdGFydFByZXYgPyB0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnQuX3ByZXYgOiB0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnQ7XG4gICAgfVxufTtcbmZ1bmN0aW9uIF9jb250ZXh0R2V0Q3JlYXRlQW5kT3JkZXJOb2RlcyhyZW5kZXJOb2RlLCBwcmV2KSB7XG4gICAgdmFyIG5vZGU7XG4gICAgdmFyIHN0YXRlID0gdGhpcy5fY29udGV4dFN0YXRlO1xuICAgIGlmICghc3RhdGUuc3RhcnQpIHtcbiAgICAgICAgbm9kZSA9IHRoaXMuX2ZpcnN0O1xuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUucmVuZGVyTm9kZSA9PT0gcmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICBub2RlID0gdGhpcy5jcmVhdGVOb2RlKHJlbmRlck5vZGUpO1xuICAgICAgICAgICAgbm9kZS5fbmV4dCA9IHRoaXMuX2ZpcnN0O1xuICAgICAgICAgICAgaWYgKHRoaXMuX2ZpcnN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmlyc3QuX3ByZXYgPSBub2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZmlyc3QgPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRlLnN0YXJ0ID0gbm9kZTtcbiAgICAgICAgc3RhdGUuc3RhcnRQcmV2ID0gcHJldjtcbiAgICAgICAgc3RhdGUucHJldiA9IG5vZGU7XG4gICAgICAgIHN0YXRlLm5leHQgPSBub2RlO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gICAgaWYgKHByZXYpIHtcbiAgICAgICAgaWYgKHN0YXRlLnByZXYuX3ByZXYgJiYgc3RhdGUucHJldi5fcHJldi5yZW5kZXJOb2RlID09PSByZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICBzdGF0ZS5wcmV2ID0gc3RhdGUucHJldi5fcHJldjtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZS5wcmV2O1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHN0YXRlLm5leHQuX25leHQgJiYgc3RhdGUubmV4dC5fbmV4dC5yZW5kZXJOb2RlID09PSByZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICBzdGF0ZS5uZXh0ID0gc3RhdGUubmV4dC5fbmV4dDtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZS5uZXh0O1xuICAgICAgICB9XG4gICAgfVxuICAgIG5vZGUgPSB0aGlzLl9maXJzdDtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBpZiAobm9kZS5yZW5kZXJOb2RlID09PSByZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICB9XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICAgIG5vZGUgPSB0aGlzLmNyZWF0ZU5vZGUocmVuZGVyTm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG5vZGUuX25leHQpIHtcbiAgICAgICAgICAgIG5vZGUuX25leHQuX3ByZXYgPSBub2RlLl9wcmV2O1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLl9wcmV2KSB7XG4gICAgICAgICAgICBub2RlLl9wcmV2Ll9uZXh0ID0gbm9kZS5fbmV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2ZpcnN0ID0gbm9kZS5fbmV4dDtcbiAgICAgICAgfVxuICAgICAgICBub2RlLl9uZXh0ID0gdW5kZWZpbmVkO1xuICAgICAgICBub2RlLl9wcmV2ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAocHJldikge1xuICAgICAgICBpZiAoc3RhdGUucHJldi5fcHJldikge1xuICAgICAgICAgICAgbm9kZS5fcHJldiA9IHN0YXRlLnByZXYuX3ByZXY7XG4gICAgICAgICAgICBzdGF0ZS5wcmV2Ll9wcmV2Ll9uZXh0ID0gbm9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2ZpcnN0ID0gbm9kZTtcbiAgICAgICAgfVxuICAgICAgICBzdGF0ZS5wcmV2Ll9wcmV2ID0gbm9kZTtcbiAgICAgICAgbm9kZS5fbmV4dCA9IHN0YXRlLnByZXY7XG4gICAgICAgIHN0YXRlLnByZXYgPSBub2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzdGF0ZS5uZXh0Ll9uZXh0KSB7XG4gICAgICAgICAgICBub2RlLl9uZXh0ID0gc3RhdGUubmV4dC5fbmV4dDtcbiAgICAgICAgICAgIHN0YXRlLm5leHQuX25leHQuX3ByZXYgPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRlLm5leHQuX25leHQgPSBub2RlO1xuICAgICAgICBub2RlLl9wcmV2ID0gc3RhdGUubmV4dDtcbiAgICAgICAgc3RhdGUubmV4dCA9IG5vZGU7XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xufVxuZnVuY3Rpb24gX2NvbnRleHROZXh0KCkge1xuICAgIGlmICghdGhpcy5fY29udGV4dFN0YXRlLm5leHRTZXF1ZW5jZSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAodGhpcy5fY29udGV4dC5yZXZlcnNlKSB7XG4gICAgICAgIHRoaXMuX2NvbnRleHRTdGF0ZS5uZXh0U2VxdWVuY2UgPSB0aGlzLl9jb250ZXh0U3RhdGUubmV4dFNlcXVlbmNlLmdldE5leHQoKTtcbiAgICAgICAgaWYgKCF0aGlzLl9jb250ZXh0U3RhdGUubmV4dFNlcXVlbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciByZW5kZXJOb2RlID0gdGhpcy5fY29udGV4dFN0YXRlLm5leHRTZXF1ZW5jZS5nZXQoKTtcbiAgICBpZiAoIXJlbmRlck5vZGUpIHtcbiAgICAgICAgdGhpcy5fY29udGV4dFN0YXRlLm5leHRTZXF1ZW5jZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdmFyIG5leHRTZXF1ZW5jZSA9IHRoaXMuX2NvbnRleHRTdGF0ZS5uZXh0U2VxdWVuY2U7XG4gICAgaWYgKCF0aGlzLl9jb250ZXh0LnJldmVyc2UpIHtcbiAgICAgICAgdGhpcy5fY29udGV4dFN0YXRlLm5leHRTZXF1ZW5jZSA9IHRoaXMuX2NvbnRleHRTdGF0ZS5uZXh0U2VxdWVuY2UuZ2V0TmV4dCgpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXJOb2RlOiByZW5kZXJOb2RlLFxuICAgICAgICB2aWV3U2VxdWVuY2U6IG5leHRTZXF1ZW5jZSxcbiAgICAgICAgbmV4dDogdHJ1ZSxcbiAgICAgICAgaW5kZXg6ICsrdGhpcy5fY29udGV4dFN0YXRlLm5leHRHZXRJbmRleFxuICAgIH07XG59XG5mdW5jdGlvbiBfY29udGV4dFByZXYoKSB7XG4gICAgaWYgKCF0aGlzLl9jb250ZXh0U3RhdGUucHJldlNlcXVlbmNlKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmICghdGhpcy5fY29udGV4dC5yZXZlcnNlKSB7XG4gICAgICAgIHRoaXMuX2NvbnRleHRTdGF0ZS5wcmV2U2VxdWVuY2UgPSB0aGlzLl9jb250ZXh0U3RhdGUucHJldlNlcXVlbmNlLmdldFByZXZpb3VzKCk7XG4gICAgICAgIGlmICghdGhpcy5fY29udGV4dFN0YXRlLnByZXZTZXF1ZW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgcmVuZGVyTm9kZSA9IHRoaXMuX2NvbnRleHRTdGF0ZS5wcmV2U2VxdWVuY2UuZ2V0KCk7XG4gICAgaWYgKCFyZW5kZXJOb2RlKSB7XG4gICAgICAgIHRoaXMuX2NvbnRleHRTdGF0ZS5wcmV2U2VxdWVuY2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHZhciBwcmV2U2VxdWVuY2UgPSB0aGlzLl9jb250ZXh0U3RhdGUucHJldlNlcXVlbmNlO1xuICAgIGlmICh0aGlzLl9jb250ZXh0LnJldmVyc2UpIHtcbiAgICAgICAgdGhpcy5fY29udGV4dFN0YXRlLnByZXZTZXF1ZW5jZSA9IHRoaXMuX2NvbnRleHRTdGF0ZS5wcmV2U2VxdWVuY2UuZ2V0UHJldmlvdXMoKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVuZGVyTm9kZTogcmVuZGVyTm9kZSxcbiAgICAgICAgdmlld1NlcXVlbmNlOiBwcmV2U2VxdWVuY2UsXG4gICAgICAgIHByZXY6IHRydWUsXG4gICAgICAgIGluZGV4OiAtLXRoaXMuX2NvbnRleHRTdGF0ZS5wcmV2R2V0SW5kZXhcbiAgICB9O1xufVxuZnVuY3Rpb24gX2NvbnRleHRHZXQoY29udGV4dE5vZGVPcklkKSB7XG4gICAgaWYgKHRoaXMuX25vZGVzQnlJZCAmJiAoY29udGV4dE5vZGVPcklkIGluc3RhbmNlb2YgU3RyaW5nIHx8IHR5cGVvZiBjb250ZXh0Tm9kZU9ySWQgPT09ICdzdHJpbmcnKSkge1xuICAgICAgICB2YXIgcmVuZGVyTm9kZSA9IHRoaXMuX25vZGVzQnlJZFtjb250ZXh0Tm9kZU9ySWRdO1xuICAgICAgICBpZiAoIXJlbmRlck5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlbmRlck5vZGUgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSByZW5kZXJOb2RlLmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyTm9kZTogcmVuZGVyTm9kZVtpXSxcbiAgICAgICAgICAgICAgICAgICAgYXJyYXlFbGVtZW50OiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZW5kZXJOb2RlOiByZW5kZXJOb2RlLFxuICAgICAgICAgICAgYnlJZDogdHJ1ZVxuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjb250ZXh0Tm9kZU9ySWQ7XG4gICAgfVxufVxuZnVuY3Rpb24gX2NvbnRleHRTZXQoY29udGV4dE5vZGVPcklkLCBzZXQpIHtcbiAgICB2YXIgY29udGV4dE5vZGUgPSB0aGlzLl9ub2Rlc0J5SWQgPyBfY29udGV4dEdldC5jYWxsKHRoaXMsIGNvbnRleHROb2RlT3JJZCkgOiBjb250ZXh0Tm9kZU9ySWQ7XG4gICAgaWYgKGNvbnRleHROb2RlKSB7XG4gICAgICAgIHZhciBub2RlID0gY29udGV4dE5vZGUubm9kZTtcbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICBpZiAoY29udGV4dE5vZGUubmV4dCkge1xuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0Tm9kZS5pbmRleCA8IHRoaXMuX2NvbnRleHRTdGF0ZS5uZXh0U2V0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgTGF5b3V0VXRpbGl0eS5lcnJvcignTm9kZXMgbXVzdCBiZSBsYXllZCBvdXQgaW4gdGhlIHNhbWUgb3JkZXIgYXMgdGhleSB3ZXJlIHJlcXVlc3RlZCEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fY29udGV4dFN0YXRlLm5leHRTZXRJbmRleCA9IGNvbnRleHROb2RlLmluZGV4O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Tm9kZS5wcmV2KSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHROb2RlLmluZGV4ID4gdGhpcy5fY29udGV4dFN0YXRlLnByZXZTZXRJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBMYXlvdXRVdGlsaXR5LmVycm9yKCdOb2RlcyBtdXN0IGJlIGxheWVkIG91dCBpbiB0aGUgc2FtZSBvcmRlciBhcyB0aGV5IHdlcmUgcmVxdWVzdGVkIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9jb250ZXh0U3RhdGUucHJldlNldEluZGV4ID0gY29udGV4dE5vZGUuaW5kZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlID0gX2NvbnRleHRHZXRDcmVhdGVBbmRPcmRlck5vZGVzLmNhbGwodGhpcywgY29udGV4dE5vZGUucmVuZGVyTm9kZSwgY29udGV4dE5vZGUucHJldik7XG4gICAgICAgICAgICBub2RlLl92aWV3U2VxdWVuY2UgPSBjb250ZXh0Tm9kZS52aWV3U2VxdWVuY2U7XG4gICAgICAgICAgICBub2RlLl9sYXlvdXRDb3VudCsrO1xuICAgICAgICAgICAgaWYgKG5vZGUuX2xheW91dENvdW50ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29udGV4dFN0YXRlLmFkZENvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250ZXh0Tm9kZS5ub2RlID0gbm9kZTtcbiAgICAgICAgfVxuICAgICAgICBub2RlLnVzZXNUcnVlU2l6ZSA9IGNvbnRleHROb2RlLnVzZXNUcnVlU2l6ZTtcbiAgICAgICAgbm9kZS50cnVlU2l6ZVJlcXVlc3RlZCA9IGNvbnRleHROb2RlLnRydWVTaXplUmVxdWVzdGVkO1xuICAgICAgICBub2RlLnNldChzZXQsIHRoaXMuX2NvbnRleHQuc2l6ZSk7XG4gICAgICAgIGNvbnRleHROb2RlLnNldCA9IHNldDtcbiAgICB9XG59XG5mdW5jdGlvbiBfY29udGV4dFJlc29sdmVTaXplKGNvbnRleHROb2RlT3JJZCwgcGFyZW50U2l6ZSkge1xuICAgIHZhciBjb250ZXh0Tm9kZSA9IHRoaXMuX25vZGVzQnlJZCA/IF9jb250ZXh0R2V0LmNhbGwodGhpcywgY29udGV4dE5vZGVPcklkKSA6IGNvbnRleHROb2RlT3JJZDtcbiAgICB2YXIgcmVzb2x2ZVNpemUgPSB0aGlzLl9wb29sLnJlc29sdmVTaXplO1xuICAgIGlmICghY29udGV4dE5vZGUpIHtcbiAgICAgICAgcmVzb2x2ZVNpemVbMF0gPSAwO1xuICAgICAgICByZXNvbHZlU2l6ZVsxXSA9IDA7XG4gICAgICAgIHJldHVybiByZXNvbHZlU2l6ZTtcbiAgICB9XG4gICAgdmFyIHJlbmRlck5vZGUgPSBjb250ZXh0Tm9kZS5yZW5kZXJOb2RlO1xuICAgIHZhciBzaXplID0gcmVuZGVyTm9kZS5nZXRTaXplKCk7XG4gICAgaWYgKCFzaXplKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnRTaXplO1xuICAgIH1cbiAgICB2YXIgY29uZmlnU2l6ZSA9IHJlbmRlck5vZGUuc2l6ZSAmJiByZW5kZXJOb2RlLl90cnVlU2l6ZUNoZWNrICE9PSB1bmRlZmluZWQgPyByZW5kZXJOb2RlLnNpemUgOiB1bmRlZmluZWQ7XG4gICAgaWYgKGNvbmZpZ1NpemUgJiYgKGNvbmZpZ1NpemVbMF0gPT09IHRydWUgfHwgY29uZmlnU2l6ZVsxXSA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgY29udGV4dE5vZGUudXNlc1RydWVTaXplID0gdHJ1ZTtcbiAgICAgICAgdmFyIGJhY2t1cFNpemUgPSByZW5kZXJOb2RlLl9iYWNrdXBTaXplO1xuICAgICAgICBpZiAocmVuZGVyTm9kZS5fdHJ1ZVNpemVDaGVjaykge1xuICAgICAgICAgICAgaWYgKGJhY2t1cFNpemUgJiYgY29uZmlnU2l6ZSAhPT0gc2l6ZSkge1xuICAgICAgICAgICAgICAgIHZhciBuZXdXaWR0aCA9IGNvbmZpZ1NpemVbMF0gPT09IHRydWUgPyBNYXRoLm1heChiYWNrdXBTaXplWzBdLCBzaXplWzBdKSA6IHNpemVbMF07XG4gICAgICAgICAgICAgICAgdmFyIG5ld0hlaWdodCA9IGNvbmZpZ1NpemVbMV0gPT09IHRydWUgPyBNYXRoLm1heChiYWNrdXBTaXplWzFdLCBzaXplWzFdKSA6IHNpemVbMV07XG4gICAgICAgICAgICAgICAgaWYgKG5ld1dpZHRoICE9PSBiYWNrdXBTaXplWzBdIHx8IG5ld0hlaWdodCAhPT0gYmFja3VwU2l6ZVsxXSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl90cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHROb2RlLnRydWVTaXplUmVxdWVzdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYmFja3VwU2l6ZVswXSA9IG5ld1dpZHRoO1xuICAgICAgICAgICAgICAgIGJhY2t1cFNpemVbMV0gPSBuZXdIZWlnaHQ7XG4gICAgICAgICAgICAgICAgc2l6ZSA9IGJhY2t1cFNpemU7XG4gICAgICAgICAgICAgICAgcmVuZGVyTm9kZS5fYmFja3VwU2l6ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBiYWNrdXBTaXplID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29udGV4dE5vZGUudHJ1ZVNpemVSZXF1ZXN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9yZWV2YWxUcnVlU2l6ZSB8fCBiYWNrdXBTaXplICYmIChiYWNrdXBTaXplWzBdICE9PSBzaXplWzBdIHx8IGJhY2t1cFNpemVbMV0gIT09IHNpemVbMV0pKSB7XG4gICAgICAgICAgICByZW5kZXJOb2RlLl90cnVlU2l6ZUNoZWNrID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlbmRlck5vZGUuX3NpemVEaXJ0eSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl90cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFiYWNrdXBTaXplKSB7XG4gICAgICAgICAgICByZW5kZXJOb2RlLl9iYWNrdXBTaXplID0gW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGJhY2t1cFNpemUgPSByZW5kZXJOb2RlLl9iYWNrdXBTaXplO1xuICAgICAgICB9XG4gICAgICAgIGJhY2t1cFNpemVbMF0gPSBzaXplWzBdO1xuICAgICAgICBiYWNrdXBTaXplWzFdID0gc2l6ZVsxXTtcbiAgICB9XG4gICAgY29uZmlnU2l6ZSA9IHJlbmRlck5vZGUuX25vZGVzID8gcmVuZGVyTm9kZS5vcHRpb25zLnNpemUgOiB1bmRlZmluZWQ7XG4gICAgaWYgKGNvbmZpZ1NpemUgJiYgKGNvbmZpZ1NpemVbMF0gPT09IHRydWUgfHwgY29uZmlnU2l6ZVsxXSA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgaWYgKHRoaXMuX3JlZXZhbFRydWVTaXplIHx8IHJlbmRlck5vZGUuX25vZGVzLl90cnVlU2l6ZVJlcXVlc3RlZCkge1xuICAgICAgICAgICAgY29udGV4dE5vZGUudXNlc1RydWVTaXplID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnRleHROb2RlLnRydWVTaXplUmVxdWVzdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3RydWVTaXplUmVxdWVzdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoc2l6ZVswXSA9PT0gdW5kZWZpbmVkIHx8IHNpemVbMF0gPT09IHRydWUgfHwgc2l6ZVsxXSA9PT0gdW5kZWZpbmVkIHx8IHNpemVbMV0gPT09IHRydWUpIHtcbiAgICAgICAgcmVzb2x2ZVNpemVbMF0gPSBzaXplWzBdO1xuICAgICAgICByZXNvbHZlU2l6ZVsxXSA9IHNpemVbMV07XG4gICAgICAgIHNpemUgPSByZXNvbHZlU2l6ZTtcbiAgICAgICAgaWYgKHNpemVbMF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc2l6ZVswXSA9IHBhcmVudFNpemVbMF07XG4gICAgICAgIH0gZWxzZSBpZiAoc2l6ZVswXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgc2l6ZVswXSA9IDA7XG4gICAgICAgICAgICB0aGlzLl90cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgICAgICBjb250ZXh0Tm9kZS50cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNpemVbMV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc2l6ZVsxXSA9IHBhcmVudFNpemVbMV07XG4gICAgICAgIH0gZWxzZSBpZiAoc2l6ZVsxXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgc2l6ZVsxXSA9IDA7XG4gICAgICAgICAgICB0aGlzLl90cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgICAgICBjb250ZXh0Tm9kZS50cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNpemU7XG59XG5tb2R1bGUuZXhwb3J0cyA9IExheW91dE5vZGVNYW5hZ2VyOyIsInZhciBVdGlsaXR5ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLnV0aWxpdGllcy5VdGlsaXR5IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnV0aWxpdGllcy5VdGlsaXR5IDogbnVsbDtcbmZ1bmN0aW9uIExheW91dFV0aWxpdHkoKSB7XG59XG5MYXlvdXRVdGlsaXR5LnJlZ2lzdGVyZWRIZWxwZXJzID0ge307XG52YXIgQ2FwYWJpbGl0aWVzID0ge1xuICAgICAgICBTRVFVRU5DRTogMSxcbiAgICAgICAgRElSRUNUSU9OX1g6IDIsXG4gICAgICAgIERJUkVDVElPTl9ZOiA0LFxuICAgICAgICBTQ1JPTExJTkc6IDhcbiAgICB9O1xuTGF5b3V0VXRpbGl0eS5DYXBhYmlsaXRpZXMgPSBDYXBhYmlsaXRpZXM7XG5MYXlvdXRVdGlsaXR5Lm5vcm1hbGl6ZU1hcmdpbnMgPSBmdW5jdGlvbiAobWFyZ2lucykge1xuICAgIGlmICghbWFyZ2lucykge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdO1xuICAgIH0gZWxzZSBpZiAoIUFycmF5LmlzQXJyYXkobWFyZ2lucykpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIG1hcmdpbnMsXG4gICAgICAgICAgICBtYXJnaW5zLFxuICAgICAgICAgICAgbWFyZ2lucyxcbiAgICAgICAgICAgIG1hcmdpbnNcbiAgICAgICAgXTtcbiAgICB9IGVsc2UgaWYgKG1hcmdpbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF07XG4gICAgfSBlbHNlIGlmIChtYXJnaW5zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgbWFyZ2luc1swXSxcbiAgICAgICAgICAgIG1hcmdpbnNbMF0sXG4gICAgICAgICAgICBtYXJnaW5zWzBdLFxuICAgICAgICAgICAgbWFyZ2luc1swXVxuICAgICAgICBdO1xuICAgIH0gZWxzZSBpZiAobWFyZ2lucy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIG1hcmdpbnNbMF0sXG4gICAgICAgICAgICBtYXJnaW5zWzFdLFxuICAgICAgICAgICAgbWFyZ2luc1swXSxcbiAgICAgICAgICAgIG1hcmdpbnNbMV1cbiAgICAgICAgXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbWFyZ2lucztcbiAgICB9XG59O1xuTGF5b3V0VXRpbGl0eS5jbG9uZVNwZWMgPSBmdW5jdGlvbiAoc3BlYykge1xuICAgIHZhciBjbG9uZSA9IHt9O1xuICAgIGlmIChzcGVjLm9wYWNpdHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjbG9uZS5vcGFjaXR5ID0gc3BlYy5vcGFjaXR5O1xuICAgIH1cbiAgICBpZiAoc3BlYy5zaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY2xvbmUuc2l6ZSA9IHNwZWMuc2l6ZS5zbGljZSgwKTtcbiAgICB9XG4gICAgaWYgKHNwZWMudHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY2xvbmUudHJhbnNmb3JtID0gc3BlYy50cmFuc2Zvcm0uc2xpY2UoMCk7XG4gICAgfVxuICAgIGlmIChzcGVjLm9yaWdpbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNsb25lLm9yaWdpbiA9IHNwZWMub3JpZ2luLnNsaWNlKDApO1xuICAgIH1cbiAgICBpZiAoc3BlYy5hbGlnbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNsb25lLmFsaWduID0gc3BlYy5hbGlnbi5zbGljZSgwKTtcbiAgICB9XG4gICAgcmV0dXJuIGNsb25lO1xufTtcbmZ1bmN0aW9uIF9pc0VxdWFsQXJyYXkoYSwgYikge1xuICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoYSA9PT0gdW5kZWZpbmVkIHx8IGIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBpID0gYS5sZW5ndGg7XG4gICAgaWYgKGkgIT09IGIubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuTGF5b3V0VXRpbGl0eS5pc0VxdWFsU3BlYyA9IGZ1bmN0aW9uIChzcGVjMSwgc3BlYzIpIHtcbiAgICBpZiAoc3BlYzEub3BhY2l0eSAhPT0gc3BlYzIub3BhY2l0eSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICghX2lzRXF1YWxBcnJheShzcGVjMS5zaXplLCBzcGVjMi5zaXplKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICghX2lzRXF1YWxBcnJheShzcGVjMS50cmFuc2Zvcm0sIHNwZWMyLnRyYW5zZm9ybSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoIV9pc0VxdWFsQXJyYXkoc3BlYzEub3JpZ2luLCBzcGVjMi5vcmlnaW4pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKCFfaXNFcXVhbEFycmF5KHNwZWMxLmFsaWduLCBzcGVjMi5hbGlnbikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5MYXlvdXRVdGlsaXR5LmdldFNwZWNEaWZmVGV4dCA9IGZ1bmN0aW9uIChzcGVjMSwgc3BlYzIpIHtcbiAgICB2YXIgcmVzdWx0ID0gJ3NwZWMgZGlmZjonO1xuICAgIGlmIChzcGVjMS5vcGFjaXR5ICE9PSBzcGVjMi5vcGFjaXR5KSB7XG4gICAgICAgIHJlc3VsdCArPSAnXFxub3BhY2l0eTogJyArIHNwZWMxLm9wYWNpdHkgKyAnICE9ICcgKyBzcGVjMi5vcGFjaXR5O1xuICAgIH1cbiAgICBpZiAoIV9pc0VxdWFsQXJyYXkoc3BlYzEuc2l6ZSwgc3BlYzIuc2l6ZSkpIHtcbiAgICAgICAgcmVzdWx0ICs9ICdcXG5zaXplOiAnICsgSlNPTi5zdHJpbmdpZnkoc3BlYzEuc2l6ZSkgKyAnICE9ICcgKyBKU09OLnN0cmluZ2lmeShzcGVjMi5zaXplKTtcbiAgICB9XG4gICAgaWYgKCFfaXNFcXVhbEFycmF5KHNwZWMxLnRyYW5zZm9ybSwgc3BlYzIudHJhbnNmb3JtKSkge1xuICAgICAgICByZXN1bHQgKz0gJ1xcbnRyYW5zZm9ybTogJyArIEpTT04uc3RyaW5naWZ5KHNwZWMxLnRyYW5zZm9ybSkgKyAnICE9ICcgKyBKU09OLnN0cmluZ2lmeShzcGVjMi50cmFuc2Zvcm0pO1xuICAgIH1cbiAgICBpZiAoIV9pc0VxdWFsQXJyYXkoc3BlYzEub3JpZ2luLCBzcGVjMi5vcmlnaW4pKSB7XG4gICAgICAgIHJlc3VsdCArPSAnXFxub3JpZ2luOiAnICsgSlNPTi5zdHJpbmdpZnkoc3BlYzEub3JpZ2luKSArICcgIT0gJyArIEpTT04uc3RyaW5naWZ5KHNwZWMyLm9yaWdpbik7XG4gICAgfVxuICAgIGlmICghX2lzRXF1YWxBcnJheShzcGVjMS5hbGlnbiwgc3BlYzIuYWxpZ24pKSB7XG4gICAgICAgIHJlc3VsdCArPSAnXFxuYWxpZ246ICcgKyBKU09OLnN0cmluZ2lmeShzcGVjMS5hbGlnbikgKyAnICE9ICcgKyBKU09OLnN0cmluZ2lmeShzcGVjMi5hbGlnbik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuTGF5b3V0VXRpbGl0eS5lcnJvciA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgY29uc29sZS5sb2coJ0VSUk9SOiAnICsgbWVzc2FnZSk7XG4gICAgdGhyb3cgbWVzc2FnZTtcbn07XG5MYXlvdXRVdGlsaXR5Lndhcm5pbmcgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgIGNvbnNvbGUubG9nKCdXQVJOSU5HOiAnICsgbWVzc2FnZSk7XG59O1xuTGF5b3V0VXRpbGl0eS5sb2cgPSBmdW5jdGlvbiAoYXJncykge1xuICAgIHZhciBtZXNzYWdlID0gJyc7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGFyZyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaWYgKGFyZyBpbnN0YW5jZW9mIE9iamVjdCB8fCBhcmcgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgbWVzc2FnZSArPSBKU09OLnN0cmluZ2lmeShhcmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZSArPSBhcmc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG59O1xuTGF5b3V0VXRpbGl0eS5jb21iaW5lT3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zMSwgb3B0aW9uczIsIGZvcmNlQ2xvbmUpIHtcbiAgICBpZiAob3B0aW9uczEgJiYgIW9wdGlvbnMyICYmICFmb3JjZUNsb25lKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zMTtcbiAgICB9IGVsc2UgaWYgKCFvcHRpb25zMSAmJiBvcHRpb25zMiAmJiAhZm9yY2VDbG9uZSkge1xuICAgICAgICByZXR1cm4gb3B0aW9uczI7XG4gICAgfVxuICAgIHZhciBvcHRpb25zID0gVXRpbGl0eS5jbG9uZShvcHRpb25zMSB8fCB7fSk7XG4gICAgaWYgKG9wdGlvbnMyKSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zMikge1xuICAgICAgICAgICAgb3B0aW9uc1trZXldID0gb3B0aW9uczJba2V5XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3B0aW9ucztcbn07XG5MYXlvdXRVdGlsaXR5LnJlZ2lzdGVySGVscGVyID0gZnVuY3Rpb24gKG5hbWUsIEhlbHBlcikge1xuICAgIGlmICghSGVscGVyLnByb3RvdHlwZS5wYXJzZSkge1xuICAgICAgICBMYXlvdXRVdGlsaXR5LmVycm9yKCdUaGUgbGF5b3V0LWhlbHBlciBmb3IgbmFtZSBcIicgKyBuYW1lICsgJ1wiIGlzIHJlcXVpcmVkIHRvIHN1cHBvcnQgdGhlIFwicGFyc2VcIiBtZXRob2QnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucmVnaXN0ZXJlZEhlbHBlcnNbbmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBMYXlvdXRVdGlsaXR5Lndhcm5pbmcoJ0EgbGF5b3V0LWhlbHBlciB3aXRoIHRoZSBuYW1lIFwiJyArIG5hbWUgKyAnXCIgaXMgYWxyZWFkeSByZWdpc3RlcmVkIGFuZCB3aWxsIGJlIG92ZXJ3cml0dGVuJyk7XG4gICAgfVxuICAgIHRoaXMucmVnaXN0ZXJlZEhlbHBlcnNbbmFtZV0gPSBIZWxwZXI7XG59O1xuTGF5b3V0VXRpbGl0eS51bnJlZ2lzdGVySGVscGVyID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5yZWdpc3RlcmVkSGVscGVyc1tuYW1lXTtcbn07XG5MYXlvdXRVdGlsaXR5LmdldFJlZ2lzdGVyZWRIZWxwZXIgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyZWRIZWxwZXJzW25hbWVdO1xufTtcbm1vZHVsZS5leHBvcnRzID0gTGF5b3V0VXRpbGl0eTsiLCJ2YXIgTGF5b3V0VXRpbGl0eSA9IHJlcXVpcmUoJy4vTGF5b3V0VXRpbGl0eScpO1xudmFyIExheW91dENvbnRyb2xsZXIgPSByZXF1aXJlKCcuL0xheW91dENvbnRyb2xsZXInKTtcbnZhciBMYXlvdXROb2RlID0gcmVxdWlyZSgnLi9MYXlvdXROb2RlJyk7XG52YXIgRmxvd0xheW91dE5vZGUgPSByZXF1aXJlKCcuL0Zsb3dMYXlvdXROb2RlJyk7XG52YXIgTGF5b3V0Tm9kZU1hbmFnZXIgPSByZXF1aXJlKCcuL0xheW91dE5vZGVNYW5hZ2VyJyk7XG52YXIgQ29udGFpbmVyU3VyZmFjZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5zdXJmYWNlcy5Db250YWluZXJTdXJmYWNlIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnN1cmZhY2VzLkNvbnRhaW5lclN1cmZhY2UgOiBudWxsO1xudmFyIFRyYW5zZm9ybSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLlRyYW5zZm9ybSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLlRyYW5zZm9ybSA6IG51bGw7XG52YXIgRXZlbnRIYW5kbGVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuRXZlbnRIYW5kbGVyIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuRXZlbnRIYW5kbGVyIDogbnVsbDtcbnZhciBHcm91cCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLkdyb3VwIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuR3JvdXAgOiBudWxsO1xudmFyIFZlY3RvciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5tYXRoLlZlY3RvciA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5tYXRoLlZlY3RvciA6IG51bGw7XG52YXIgUGh5c2ljc0VuZ2luZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5waHlzaWNzLlBoeXNpY3NFbmdpbmUgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMucGh5c2ljcy5QaHlzaWNzRW5naW5lIDogbnVsbDtcbnZhciBQYXJ0aWNsZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5waHlzaWNzLmJvZGllcy5QYXJ0aWNsZSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5waHlzaWNzLmJvZGllcy5QYXJ0aWNsZSA6IG51bGw7XG52YXIgRHJhZyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5waHlzaWNzLmZvcmNlcy5EcmFnIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnBoeXNpY3MuZm9yY2VzLkRyYWcgOiBudWxsO1xudmFyIFNwcmluZyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5waHlzaWNzLmZvcmNlcy5TcHJpbmcgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMucGh5c2ljcy5mb3JjZXMuU3ByaW5nIDogbnVsbDtcbnZhciBTY3JvbGxTeW5jID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmlucHV0cy5TY3JvbGxTeW5jIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmlucHV0cy5TY3JvbGxTeW5jIDogbnVsbDtcbnZhciBWaWV3U2VxdWVuY2UgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5WaWV3U2VxdWVuY2UgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5WaWV3U2VxdWVuY2UgOiBudWxsO1xudmFyIEJvdW5kcyA9IHtcbiAgICAgICAgTk9ORTogMCxcbiAgICAgICAgUFJFVjogMSxcbiAgICAgICAgTkVYVDogMixcbiAgICAgICAgQk9USDogM1xuICAgIH07XG52YXIgU3ByaW5nU291cmNlID0ge1xuICAgICAgICBOT05FOiAnbm9uZScsXG4gICAgICAgIE5FWFRCT1VORFM6ICduZXh0LWJvdW5kcycsXG4gICAgICAgIFBSRVZCT1VORFM6ICdwcmV2LWJvdW5kcycsXG4gICAgICAgIE1JTlNJWkU6ICdtaW5pbWFsLXNpemUnLFxuICAgICAgICBHT1RPU0VRVUVOQ0U6ICdnb3RvLXNlcXVlbmNlJyxcbiAgICAgICAgRU5TVVJFVklTSUJMRTogJ2Vuc3VyZS12aXNpYmxlJyxcbiAgICAgICAgR09UT1BSRVZESVJFQ1RJT046ICdnb3RvLXByZXYtZGlyZWN0aW9uJyxcbiAgICAgICAgR09UT05FWFRESVJFQ1RJT046ICdnb3RvLW5leHQtZGlyZWN0aW9uJ1xuICAgIH07XG52YXIgUGFnaW5hdGlvbk1vZGUgPSB7XG4gICAgICAgIFBBR0U6IDAsXG4gICAgICAgIFNDUk9MTDogMVxuICAgIH07XG5mdW5jdGlvbiBTY3JvbGxDb250cm9sbGVyKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gTGF5b3V0VXRpbGl0eS5jb21iaW5lT3B0aW9ucyhTY3JvbGxDb250cm9sbGVyLkRFRkFVTFRfT1BUSU9OUywgb3B0aW9ucyk7XG4gICAgdmFyIGxheW91dE1hbmFnZXIgPSBuZXcgTGF5b3V0Tm9kZU1hbmFnZXIob3B0aW9ucy5mbG93ID8gRmxvd0xheW91dE5vZGUgOiBMYXlvdXROb2RlLCBfaW5pdExheW91dE5vZGUuYmluZCh0aGlzKSk7XG4gICAgTGF5b3V0Q29udHJvbGxlci5jYWxsKHRoaXMsIG9wdGlvbnMsIGxheW91dE1hbmFnZXIpO1xuICAgIHRoaXMuX3Njcm9sbCA9IHtcbiAgICAgICAgYWN0aXZlVG91Y2hlczogW10sXG4gICAgICAgIHBlOiBuZXcgUGh5c2ljc0VuZ2luZSgpLFxuICAgICAgICBwYXJ0aWNsZTogbmV3IFBhcnRpY2xlKHRoaXMub3B0aW9ucy5zY3JvbGxQYXJ0aWNsZSksXG4gICAgICAgIGRyYWdGb3JjZTogbmV3IERyYWcodGhpcy5vcHRpb25zLnNjcm9sbERyYWcpLFxuICAgICAgICBmcmljdGlvbkZvcmNlOiBuZXcgRHJhZyh0aGlzLm9wdGlvbnMuc2Nyb2xsRnJpY3Rpb24pLFxuICAgICAgICBzcHJpbmdWYWx1ZTogdW5kZWZpbmVkLFxuICAgICAgICBzcHJpbmdGb3JjZTogbmV3IFNwcmluZyh0aGlzLm9wdGlvbnMuc2Nyb2xsU3ByaW5nKSxcbiAgICAgICAgc3ByaW5nRW5kU3RhdGU6IG5ldyBWZWN0b3IoW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0pLFxuICAgICAgICBncm91cFN0YXJ0OiAwLFxuICAgICAgICBncm91cFRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHNjcm9sbERlbHRhOiAwLFxuICAgICAgICBub3JtYWxpemVkU2Nyb2xsRGVsdGE6IDAsXG4gICAgICAgIHNjcm9sbEZvcmNlOiAwLFxuICAgICAgICBzY3JvbGxGb3JjZUNvdW50OiAwLFxuICAgICAgICB1bm5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQ6IDAsXG4gICAgICAgIGlzU2Nyb2xsaW5nOiBmYWxzZVxuICAgIH07XG4gICAgdGhpcy5fZGVidWcgPSB7XG4gICAgICAgIGxheW91dENvdW50OiAwLFxuICAgICAgICBjb21taXRDb3VudDogMFxuICAgIH07XG4gICAgdGhpcy5ncm91cCA9IG5ldyBHcm91cCgpO1xuICAgIHRoaXMuZ3JvdXAuYWRkKHsgcmVuZGVyOiBfaW5uZXJSZW5kZXIuYmluZCh0aGlzKSB9KTtcbiAgICB0aGlzLl9zY3JvbGwucGUuYWRkQm9keSh0aGlzLl9zY3JvbGwucGFydGljbGUpO1xuICAgIGlmICghdGhpcy5vcHRpb25zLnNjcm9sbERyYWcuZGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLmRyYWdGb3JjZUlkID0gdGhpcy5fc2Nyb2xsLnBlLmF0dGFjaCh0aGlzLl9zY3JvbGwuZHJhZ0ZvcmNlLCB0aGlzLl9zY3JvbGwucGFydGljbGUpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5zY3JvbGxGcmljdGlvbi5kaXNhYmxlZCkge1xuICAgICAgICB0aGlzLl9zY3JvbGwuZnJpY3Rpb25Gb3JjZUlkID0gdGhpcy5fc2Nyb2xsLnBlLmF0dGFjaCh0aGlzLl9zY3JvbGwuZnJpY3Rpb25Gb3JjZSwgdGhpcy5fc2Nyb2xsLnBhcnRpY2xlKTtcbiAgICB9XG4gICAgdGhpcy5fc2Nyb2xsLnNwcmluZ0ZvcmNlLnNldE9wdGlvbnMoeyBhbmNob3I6IHRoaXMuX3Njcm9sbC5zcHJpbmdFbmRTdGF0ZSB9KTtcbiAgICB0aGlzLl9ldmVudElucHV0Lm9uKCd0b3VjaHN0YXJ0JywgX3RvdWNoU3RhcnQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dC5vbigndG91Y2htb3ZlJywgX3RvdWNoTW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9ldmVudElucHV0Lm9uKCd0b3VjaGVuZCcsIF90b3VjaEVuZC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9ldmVudElucHV0Lm9uKCd0b3VjaGNhbmNlbCcsIF90b3VjaEVuZC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9ldmVudElucHV0Lm9uKCdtb3VzZWRvd24nLCBfbW91c2VEb3duLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2V2ZW50SW5wdXQub24oJ21vdXNldXAnLCBfbW91c2VVcC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9ldmVudElucHV0Lm9uKCdtb3VzZW1vdmUnLCBfbW91c2VNb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX3Njcm9sbFN5bmMgPSBuZXcgU2Nyb2xsU3luYyh0aGlzLm9wdGlvbnMuc2Nyb2xsU3luYyk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dC5waXBlKHRoaXMuX3Njcm9sbFN5bmMpO1xuICAgIHRoaXMuX3Njcm9sbFN5bmMub24oJ3VwZGF0ZScsIF9zY3JvbGxVcGRhdGUuYmluZCh0aGlzKSk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy51c2VDb250YWluZXIpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBuZXcgQ29udGFpbmVyU3VyZmFjZSh0aGlzLm9wdGlvbnMuY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuYWRkKHtcbiAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmlkO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5hdXRvUGlwZUV2ZW50cykge1xuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmUodGhpcy5jb250YWluZXIpO1xuICAgICAgICAgICAgRXZlbnRIYW5kbGVyLnNldElucHV0SGFuZGxlcih0aGlzLmNvbnRhaW5lciwgdGhpcyk7XG4gICAgICAgICAgICBFdmVudEhhbmRsZXIuc2V0T3V0cHV0SGFuZGxlcih0aGlzLmNvbnRhaW5lciwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUpO1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTY3JvbGxDb250cm9sbGVyO1xuU2Nyb2xsQ29udHJvbGxlci5Cb3VuZHMgPSBCb3VuZHM7XG5TY3JvbGxDb250cm9sbGVyLlBhZ2luYXRpb25Nb2RlID0gUGFnaW5hdGlvbk1vZGU7XG5TY3JvbGxDb250cm9sbGVyLkRFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICBmbG93OiBmYWxzZSxcbiAgICB1c2VDb250YWluZXI6IGZhbHNlLFxuICAgIGNvbnRhaW5lcjogeyBwcm9wZXJ0aWVzOiB7IG92ZXJmbG93OiAnaGlkZGVuJyB9IH0sXG4gICAgdmlzaWJsZUl0ZW1UaHJlc3Nob2xkOiAwLjUsXG4gICAgc2Nyb2xsUGFydGljbGU6IHt9LFxuICAgIHNjcm9sbERyYWc6IHtcbiAgICAgICAgZm9yY2VGdW5jdGlvbjogRHJhZy5GT1JDRV9GVU5DVElPTlMuUVVBRFJBVElDLFxuICAgICAgICBzdHJlbmd0aDogMC4wMDEsXG4gICAgICAgIGRpc2FibGVkOiB0cnVlXG4gICAgfSxcbiAgICBzY3JvbGxGcmljdGlvbjoge1xuICAgICAgICBmb3JjZUZ1bmN0aW9uOiBEcmFnLkZPUkNFX0ZVTkNUSU9OUy5MSU5FQVIsXG4gICAgICAgIHN0cmVuZ3RoOiAwLjAwMjUsXG4gICAgICAgIGRpc2FibGVkOiBmYWxzZVxuICAgIH0sXG4gICAgc2Nyb2xsU3ByaW5nOiB7XG4gICAgICAgIGRhbXBpbmdSYXRpbzogMSxcbiAgICAgICAgcGVyaW9kOiAzNTBcbiAgICB9LFxuICAgIHNjcm9sbFN5bmM6IHsgc2NhbGU6IDAuMiB9LFxuICAgIHBhZ2luYXRlZDogZmFsc2UsXG4gICAgcGFnaW5hdGlvbk1vZGU6IFBhZ2luYXRpb25Nb2RlLlBBR0UsXG4gICAgcGFnaW5hdGlvbkVuZXJneVRocmVzc2hvbGQ6IDAuMDEsXG4gICAgYWxpZ25tZW50OiAwLFxuICAgIHRvdWNoTW92ZURpcmVjdGlvblRocmVzc2hvbGQ6IHVuZGVmaW5lZCxcbiAgICB0b3VjaE1vdmVOb1ZlbG9jaXR5RHVyYXRpb246IDEwMCxcbiAgICBtb3VzZU1vdmU6IGZhbHNlLFxuICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgbGF5b3V0QWxsOiBmYWxzZSxcbiAgICBhbHdheXNMYXlvdXQ6IGZhbHNlLFxuICAgIGV4dHJhQm91bmRzU3BhY2U6IFtcbiAgICAgICAgMTAwLFxuICAgICAgICAxMDBcbiAgICBdLFxuICAgIGRlYnVnOiBmYWxzZVxufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIExheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnNldE9wdGlvbnMuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICBpZiAodGhpcy5fc2Nyb2xsKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnNjcm9sbFNwcmluZykge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ0ZvcmNlLnNldE9wdGlvbnMob3B0aW9ucy5zY3JvbGxTcHJpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLnNjcm9sbERyYWcpIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5kcmFnRm9yY2Uuc2V0T3B0aW9ucyhvcHRpb25zLnNjcm9sbERyYWcpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChvcHRpb25zLnNjcm9sbFN5bmMgJiYgdGhpcy5fc2Nyb2xsU3luYykge1xuICAgICAgICB0aGlzLl9zY3JvbGxTeW5jLnNldE9wdGlvbnMob3B0aW9ucy5zY3JvbGxTeW5jKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuZnVuY3Rpb24gX2luaXRMYXlvdXROb2RlKG5vZGUsIHNwZWMpIHtcbiAgICBpZiAoIXNwZWMgJiYgdGhpcy5vcHRpb25zLmluc2VydFNwZWMpIHtcbiAgICAgICAgbm9kZS5zZXRTcGVjKHRoaXMub3B0aW9ucy5pbnNlcnRTcGVjKTtcbiAgICB9XG59XG5mdW5jdGlvbiBfdXBkYXRlU3ByaW5nKCkge1xuICAgIHZhciBzcHJpbmdWYWx1ZSA9IHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50ID8gdW5kZWZpbmVkIDogdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uO1xuICAgIGlmICh0aGlzLl9zY3JvbGwuc3ByaW5nVmFsdWUgIT09IHNwcmluZ1ZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdWYWx1ZSA9IHNwcmluZ1ZhbHVlO1xuICAgICAgICBpZiAoc3ByaW5nVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5zcHJpbmdGb3JjZUlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwucGUuZGV0YWNoKHRoaXMuX3Njcm9sbC5zcHJpbmdGb3JjZUlkKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nRm9yY2VJZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zY3JvbGwuc3ByaW5nRm9yY2VJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ0ZvcmNlSWQgPSB0aGlzLl9zY3JvbGwucGUuYXR0YWNoKHRoaXMuX3Njcm9sbC5zcHJpbmdGb3JjZSwgdGhpcy5fc2Nyb2xsLnBhcnRpY2xlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdFbmRTdGF0ZS5zZXQxRChzcHJpbmdWYWx1ZSk7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwucGUud2FrZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gX21vdXNlRG93bihldmVudCkge1xuICAgIGlmICghdGhpcy5vcHRpb25zLm1vdXNlTW92ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl9zY3JvbGwubW91c2VNb3ZlKSB7XG4gICAgICAgIHRoaXMucmVsZWFzZVNjcm9sbEZvcmNlKHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUuZGVsdGEpO1xuICAgIH1cbiAgICB2YXIgY3VycmVudCA9IFtcbiAgICAgICAgICAgIGV2ZW50LmNsaWVudFgsXG4gICAgICAgICAgICBldmVudC5jbGllbnRZXG4gICAgICAgIF07XG4gICAgdmFyIHRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUgPSB7XG4gICAgICAgIGRlbHRhOiAwLFxuICAgICAgICBzdGFydDogY3VycmVudCxcbiAgICAgICAgY3VycmVudDogY3VycmVudCxcbiAgICAgICAgcHJldjogY3VycmVudCxcbiAgICAgICAgdGltZTogdGltZSxcbiAgICAgICAgcHJldlRpbWU6IHRpbWVcbiAgICB9O1xuICAgIHRoaXMuYXBwbHlTY3JvbGxGb3JjZSh0aGlzLl9zY3JvbGwubW91c2VNb3ZlLmRlbHRhKTtcbn1cbmZ1bmN0aW9uIF9tb3VzZU1vdmUoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuX3Njcm9sbC5tb3VzZU1vdmUgfHwgIXRoaXMub3B0aW9ucy5lbmFibGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIG1vdmVEaXJlY3Rpb24gPSBNYXRoLmF0YW4yKE1hdGguYWJzKGV2ZW50LmNsaWVudFkgLSB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLnByZXZbMV0pLCBNYXRoLmFicyhldmVudC5jbGllbnRYIC0gdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS5wcmV2WzBdKSkgLyAoTWF0aC5QSSAvIDIpO1xuICAgIHZhciBkaXJlY3Rpb25EaWZmID0gTWF0aC5hYnModGhpcy5fZGlyZWN0aW9uIC0gbW92ZURpcmVjdGlvbik7XG4gICAgaWYgKHRoaXMub3B0aW9ucy50b3VjaE1vdmVEaXJlY3Rpb25UaHJlc3Nob2xkID09PSB1bmRlZmluZWQgfHwgZGlyZWN0aW9uRGlmZiA8PSB0aGlzLm9wdGlvbnMudG91Y2hNb3ZlRGlyZWN0aW9uVGhyZXNzaG9sZCkge1xuICAgICAgICB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLnByZXYgPSB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLmN1cnJlbnQ7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUuY3VycmVudCA9IFtcbiAgICAgICAgICAgIGV2ZW50LmNsaWVudFgsXG4gICAgICAgICAgICBldmVudC5jbGllbnRZXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUucHJldlRpbWUgPSB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLnRpbWU7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUuZGlyZWN0aW9uID0gbW92ZURpcmVjdGlvbjtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS50aW1lID0gRGF0ZS5ub3coKTtcbiAgICB9XG4gICAgdmFyIGRlbHRhID0gdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS5jdXJyZW50W3RoaXMuX2RpcmVjdGlvbl0gLSB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLnN0YXJ0W3RoaXMuX2RpcmVjdGlvbl07XG4gICAgdGhpcy51cGRhdGVTY3JvbGxGb3JjZSh0aGlzLl9zY3JvbGwubW91c2VNb3ZlLmRlbHRhLCBkZWx0YSk7XG4gICAgdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS5kZWx0YSA9IGRlbHRhO1xufVxuZnVuY3Rpb24gX21vdXNlVXAoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuX3Njcm9sbC5tb3VzZU1vdmUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdmVsb2NpdHkgPSAwO1xuICAgIHZhciBkaWZmVGltZSA9IHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUudGltZSAtIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUucHJldlRpbWU7XG4gICAgaWYgKGRpZmZUaW1lID4gMCAmJiBEYXRlLm5vdygpIC0gdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS50aW1lIDw9IHRoaXMub3B0aW9ucy50b3VjaE1vdmVOb1ZlbG9jaXR5RHVyYXRpb24pIHtcbiAgICAgICAgdmFyIGRpZmZPZmZzZXQgPSB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLmN1cnJlbnRbdGhpcy5fZGlyZWN0aW9uXSAtIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUucHJldlt0aGlzLl9kaXJlY3Rpb25dO1xuICAgICAgICB2ZWxvY2l0eSA9IGRpZmZPZmZzZXQgLyBkaWZmVGltZTtcbiAgICB9XG4gICAgdGhpcy5yZWxlYXNlU2Nyb2xsRm9yY2UodGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS5kZWx0YSwgdmVsb2NpdHkpO1xuICAgIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUgPSB1bmRlZmluZWQ7XG59XG5mdW5jdGlvbiBfdG91Y2hTdGFydChldmVudCkge1xuICAgIGlmICghdGhpcy5fdG91Y2hFbmRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgIHRoaXMuX3RvdWNoRW5kRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudDIpIHtcbiAgICAgICAgICAgIGV2ZW50Mi50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl90b3VjaEVuZEV2ZW50TGlzdGVuZXIpO1xuICAgICAgICAgICAgX3RvdWNoRW5kLmNhbGwodGhpcywgZXZlbnQyKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuICAgIH1cbiAgICB2YXIgb2xkVG91Y2hlc0NvdW50ID0gdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXMubGVuZ3RoO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgajtcbiAgICB2YXIgdG91Y2hGb3VuZDtcbiAgICB3aGlsZSAoaSA8IHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzLmxlbmd0aCkge1xuICAgICAgICB2YXIgYWN0aXZlVG91Y2ggPSB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlc1tpXTtcbiAgICAgICAgdG91Y2hGb3VuZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgZXZlbnQudG91Y2hlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdmFyIHRvdWNoID0gZXZlbnQudG91Y2hlc1tqXTtcbiAgICAgICAgICAgIGlmICh0b3VjaC5pZGVudGlmaWVyID09PSBhY3RpdmVUb3VjaC5pZCkge1xuICAgICAgICAgICAgICAgIHRvdWNoRm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdG91Y2hGb3VuZCkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBldmVudC50b3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGFuZ2VkVG91Y2ggPSBldmVudC50b3VjaGVzW2ldO1xuICAgICAgICB0b3VjaEZvdW5kID0gZmFsc2U7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzW2pdLmlkID09PSBjaGFuZ2VkVG91Y2guaWRlbnRpZmllcikge1xuICAgICAgICAgICAgICAgIHRvdWNoRm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdG91Y2hGb3VuZCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSBbXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWRUb3VjaC5jbGllbnRYLFxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkVG91Y2guY2xpZW50WVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB2YXIgdGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogY2hhbmdlZFRvdWNoLmlkZW50aWZpZXIsXG4gICAgICAgICAgICAgICAgc3RhcnQ6IGN1cnJlbnQsXG4gICAgICAgICAgICAgICAgY3VycmVudDogY3VycmVudCxcbiAgICAgICAgICAgICAgICBwcmV2OiBjdXJyZW50LFxuICAgICAgICAgICAgICAgIHRpbWU6IHRpbWUsXG4gICAgICAgICAgICAgICAgcHJldlRpbWU6IHRpbWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2hhbmdlZFRvdWNoLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX3RvdWNoRW5kRXZlbnRMaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFvbGRUb3VjaGVzQ291bnQgJiYgdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuYXBwbHlTY3JvbGxGb3JjZSgwKTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnRvdWNoRGVsdGEgPSAwO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF90b3VjaE1vdmUoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMub3B0aW9ucy5lbmFibGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHByaW1hcnlUb3VjaDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGFuZ2VkVG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1tpXTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdmFyIHRvdWNoID0gdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXNbal07XG4gICAgICAgICAgICBpZiAodG91Y2guaWQgPT09IGNoYW5nZWRUb3VjaC5pZGVudGlmaWVyKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1vdmVEaXJlY3Rpb24gPSBNYXRoLmF0YW4yKE1hdGguYWJzKGNoYW5nZWRUb3VjaC5jbGllbnRZIC0gdG91Y2gucHJldlsxXSksIE1hdGguYWJzKGNoYW5nZWRUb3VjaC5jbGllbnRYIC0gdG91Y2gucHJldlswXSkpIC8gKE1hdGguUEkgLyAyKTtcbiAgICAgICAgICAgICAgICB2YXIgZGlyZWN0aW9uRGlmZiA9IE1hdGguYWJzKHRoaXMuX2RpcmVjdGlvbiAtIG1vdmVEaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMudG91Y2hNb3ZlRGlyZWN0aW9uVGhyZXNzaG9sZCA9PT0gdW5kZWZpbmVkIHx8IGRpcmVjdGlvbkRpZmYgPD0gdGhpcy5vcHRpb25zLnRvdWNoTW92ZURpcmVjdGlvblRocmVzc2hvbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgdG91Y2gucHJldiA9IHRvdWNoLmN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgIHRvdWNoLmN1cnJlbnQgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkVG91Y2guY2xpZW50WCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZWRUb3VjaC5jbGllbnRZXG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIHRvdWNoLnByZXZUaW1lID0gdG91Y2gudGltZTtcbiAgICAgICAgICAgICAgICAgICAgdG91Y2guZGlyZWN0aW9uID0gbW92ZURpcmVjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgdG91Y2gudGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlUb3VjaCA9IGogPT09IDAgPyB0b3VjaCA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByaW1hcnlUb3VjaCkge1xuICAgICAgICB2YXIgZGVsdGEgPSBwcmltYXJ5VG91Y2guY3VycmVudFt0aGlzLl9kaXJlY3Rpb25dIC0gcHJpbWFyeVRvdWNoLnN0YXJ0W3RoaXMuX2RpcmVjdGlvbl07XG4gICAgICAgIHRoaXMudXBkYXRlU2Nyb2xsRm9yY2UodGhpcy5fc2Nyb2xsLnRvdWNoRGVsdGEsIGRlbHRhKTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnRvdWNoRGVsdGEgPSBkZWx0YTtcbiAgICB9XG59XG5mdW5jdGlvbiBfdG91Y2hFbmQoZXZlbnQpIHtcbiAgICB2YXIgcHJpbWFyeVRvdWNoID0gdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXMubGVuZ3RoID8gdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXNbMF0gOiB1bmRlZmluZWQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hhbmdlZFRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbaV07XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHZhciB0b3VjaCA9IHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzW2pdO1xuICAgICAgICAgICAgaWYgKHRvdWNoLmlkID09PSBjaGFuZ2VkVG91Y2guaWRlbnRpZmllcikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzLnNwbGljZShqLCAxKTtcbiAgICAgICAgICAgICAgICBpZiAoaiA9PT0gMCAmJiB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1ByaW1hcnlUb3VjaCA9IHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzWzBdO1xuICAgICAgICAgICAgICAgICAgICBuZXdQcmltYXJ5VG91Y2guc3RhcnRbMF0gPSBuZXdQcmltYXJ5VG91Y2guY3VycmVudFswXSAtICh0b3VjaC5jdXJyZW50WzBdIC0gdG91Y2guc3RhcnRbMF0pO1xuICAgICAgICAgICAgICAgICAgICBuZXdQcmltYXJ5VG91Y2guc3RhcnRbMV0gPSBuZXdQcmltYXJ5VG91Y2guY3VycmVudFsxXSAtICh0b3VjaC5jdXJyZW50WzFdIC0gdG91Y2guc3RhcnRbMV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXByaW1hcnlUb3VjaCB8fCB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdmVsb2NpdHkgPSAwO1xuICAgIHZhciBkaWZmVGltZSA9IHByaW1hcnlUb3VjaC50aW1lIC0gcHJpbWFyeVRvdWNoLnByZXZUaW1lO1xuICAgIGlmIChkaWZmVGltZSA+IDAgJiYgRGF0ZS5ub3coKSAtIHByaW1hcnlUb3VjaC50aW1lIDw9IHRoaXMub3B0aW9ucy50b3VjaE1vdmVOb1ZlbG9jaXR5RHVyYXRpb24pIHtcbiAgICAgICAgdmFyIGRpZmZPZmZzZXQgPSBwcmltYXJ5VG91Y2guY3VycmVudFt0aGlzLl9kaXJlY3Rpb25dIC0gcHJpbWFyeVRvdWNoLnByZXZbdGhpcy5fZGlyZWN0aW9uXTtcbiAgICAgICAgdmVsb2NpdHkgPSBkaWZmT2Zmc2V0IC8gZGlmZlRpbWU7XG4gICAgfVxuICAgIHZhciBkZWx0YSA9IHRoaXMuX3Njcm9sbC50b3VjaERlbHRhO1xuICAgIHRoaXMucmVsZWFzZVNjcm9sbEZvcmNlKGRlbHRhLCB2ZWxvY2l0eSk7XG4gICAgdGhpcy5fc2Nyb2xsLnRvdWNoRGVsdGEgPSAwO1xufVxuZnVuY3Rpb24gX3Njcm9sbFVwZGF0ZShldmVudCkge1xuICAgIGlmICghdGhpcy5vcHRpb25zLmVuYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgb2Zmc2V0ID0gQXJyYXkuaXNBcnJheShldmVudC5kZWx0YSkgPyBldmVudC5kZWx0YVt0aGlzLl9kaXJlY3Rpb25dIDogZXZlbnQuZGVsdGE7XG4gICAgdGhpcy5zY3JvbGwob2Zmc2V0KTtcbn1cbmZ1bmN0aW9uIF9zZXRQYXJ0aWNsZShwb3NpdGlvbiwgdmVsb2NpdHksIHBoYXNlKSB7XG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnBhcnRpY2xlVmFsdWUgPSBwb3NpdGlvbjtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnBhcnRpY2xlLnNldFBvc2l0aW9uMUQocG9zaXRpb24pO1xuICAgIH1cbiAgICBpZiAodmVsb2NpdHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgb2xkVmVsb2NpdHkgPSB0aGlzLl9zY3JvbGwucGFydGljbGUuZ2V0VmVsb2NpdHkxRCgpO1xuICAgICAgICBpZiAob2xkVmVsb2NpdHkgIT09IHZlbG9jaXR5KSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwucGFydGljbGUuc2V0VmVsb2NpdHkxRCh2ZWxvY2l0eSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBfY2FsY1Njcm9sbE9mZnNldChub3JtYWxpemUsIHJlZnJlc2hQYXJ0aWNsZSkge1xuICAgIGlmIChyZWZyZXNoUGFydGljbGUgfHwgdGhpcy5fc2Nyb2xsLnBhcnRpY2xlVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLl9zY3JvbGwucGFydGljbGVWYWx1ZSA9IHRoaXMuX3Njcm9sbC5wYXJ0aWNsZS5nZXRQb3NpdGlvbjFEKCk7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5wYXJ0aWNsZVZhbHVlID0gTWF0aC5yb3VuZCh0aGlzLl9zY3JvbGwucGFydGljbGVWYWx1ZSAqIDEwMDApIC8gMTAwMDtcbiAgICB9XG4gICAgdmFyIHNjcm9sbE9mZnNldCA9IHRoaXMuX3Njcm9sbC5wYXJ0aWNsZVZhbHVlO1xuICAgIGlmICh0aGlzLl9zY3JvbGwuc2Nyb2xsRGVsdGEgfHwgdGhpcy5fc2Nyb2xsLm5vcm1hbGl6ZWRTY3JvbGxEZWx0YSkge1xuICAgICAgICBzY3JvbGxPZmZzZXQgKz0gdGhpcy5fc2Nyb2xsLnNjcm9sbERlbHRhICsgdGhpcy5fc2Nyb2xsLm5vcm1hbGl6ZWRTY3JvbGxEZWx0YTtcbiAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkICYgQm91bmRzLlBSRVYgJiYgc2Nyb2xsT2Zmc2V0ID4gdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uIHx8IHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkICYgQm91bmRzLk5FWFQgJiYgc2Nyb2xsT2Zmc2V0IDwgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uIHx8IHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkID09PSBCb3VuZHMuQk9USCkge1xuICAgICAgICAgICAgc2Nyb2xsT2Zmc2V0ID0gdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3JtYWxpemUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fc2Nyb2xsLnNjcm9sbERlbHRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLm5vcm1hbGl6ZWRTY3JvbGxEZWx0YSA9IDA7XG4gICAgICAgICAgICAgICAgX3NldFBhcnRpY2xlLmNhbGwodGhpcywgc2Nyb2xsT2Zmc2V0LCB1bmRlZmluZWQsICdfY2FsY1Njcm9sbE9mZnNldCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLm5vcm1hbGl6ZWRTY3JvbGxEZWx0YSArPSB0aGlzLl9zY3JvbGwuc2Nyb2xsRGVsdGE7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRGVsdGEgPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VDb3VudCAmJiB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2UpIHtcbiAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzY3JvbGxPZmZzZXQgPSAoc2Nyb2xsT2Zmc2V0ICsgdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlICsgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uKSAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzY3JvbGxPZmZzZXQgKz0gdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzY3JvbGxPZmZzZXQ7XG59XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5fY2FsY1Njcm9sbEhlaWdodCA9IGZ1bmN0aW9uIChuZXh0LCBsYXN0Tm9kZU9ubHkpIHtcbiAgICB2YXIgY2FsY2VkSGVpZ2h0ID0gMDtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUobmV4dCk7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUuX2ludmFsaWRhdGVkKSB7XG4gICAgICAgICAgICBpZiAobm9kZS50cnVlU2l6ZVJlcXVlc3RlZCkge1xuICAgICAgICAgICAgICAgIGNhbGNlZEhlaWdodCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub2RlLnNjcm9sbExlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY2FsY2VkSGVpZ2h0ID0gbGFzdE5vZGVPbmx5ID8gbm9kZS5zY3JvbGxMZW5ndGggOiBjYWxjZWRIZWlnaHQgKyBub2RlLnNjcm9sbExlbmd0aDtcbiAgICAgICAgICAgICAgICBpZiAoIW5leHQgJiYgbGFzdE5vZGVPbmx5KSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbmV4dCA/IG5vZGUuX25leHQgOiBub2RlLl9wcmV2O1xuICAgIH1cbiAgICByZXR1cm4gY2FsY2VkSGVpZ2h0O1xufTtcbmZ1bmN0aW9uIF9jYWxjQm91bmRzKHNpemUsIHNjcm9sbE9mZnNldCkge1xuICAgIHZhciBwcmV2SGVpZ2h0ID0gdGhpcy5fY2FsY1Njcm9sbEhlaWdodChmYWxzZSk7XG4gICAgdmFyIG5leHRIZWlnaHQgPSB0aGlzLl9jYWxjU2Nyb2xsSGVpZ2h0KHRydWUpO1xuICAgIHZhciBlbmZvcmVNaW5TaXplID0gdGhpcy5fbGF5b3V0LmNhcGFiaWxpdGllcyAmJiB0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzLnNlcXVlbnRpYWxTY3JvbGxpbmdPcHRpbWl6ZWQ7XG4gICAgaWYgKHByZXZIZWlnaHQgPT09IHVuZGVmaW5lZCB8fCBuZXh0SGVpZ2h0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPSBCb3VuZHMuTk9ORTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLk5PTkU7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRvdGFsSGVpZ2h0O1xuICAgIGlmIChlbmZvcmVNaW5TaXplKSB7XG4gICAgICAgIGlmIChuZXh0SGVpZ2h0ICE9PSB1bmRlZmluZWQgJiYgcHJldkhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0b3RhbEhlaWdodCA9IHByZXZIZWlnaHQgKyBuZXh0SGVpZ2h0O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b3RhbEhlaWdodCAhPT0gdW5kZWZpbmVkICYmIHRvdGFsSGVpZ2h0IDw9IHNpemVbdGhpcy5fZGlyZWN0aW9uXSkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPSBCb3VuZHMuQk9USDtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPyAtbmV4dEhlaWdodCA6IHByZXZIZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLk1JTlNJWkU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgaWYgKGVuZm9yZU1pblNpemUpIHtcbiAgICAgICAgICAgIGlmIChuZXh0SGVpZ2h0ICE9PSB1bmRlZmluZWQgJiYgc2Nyb2xsT2Zmc2V0ICsgbmV4dEhlaWdodCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPSBCb3VuZHMuTkVYVDtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gPSAtbmV4dEhlaWdodDtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLk5FWFRCT1VORFM7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGZpcnN0UHJldkl0ZW1IZWlnaHQgPSB0aGlzLl9jYWxjU2Nyb2xsSGVpZ2h0KGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICAgIGlmIChuZXh0SGVpZ2h0ICE9PSB1bmRlZmluZWQgJiYgZmlyc3RQcmV2SXRlbUhlaWdodCAmJiBzY3JvbGxPZmZzZXQgKyBuZXh0SGVpZ2h0ICsgc2l6ZVt0aGlzLl9kaXJlY3Rpb25dIDw9IGZpcnN0UHJldkl0ZW1IZWlnaHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuYm91bmRzUmVhY2hlZCA9IEJvdW5kcy5ORVhUO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IG5leHRIZWlnaHQgLSAoc2l6ZVt0aGlzLl9kaXJlY3Rpb25dIC0gZmlyc3RQcmV2SXRlbUhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1NvdXJjZSA9IFNwcmluZ1NvdXJjZS5ORVhUQk9VTkRTO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChwcmV2SGVpZ2h0ICE9PSB1bmRlZmluZWQgJiYgc2Nyb2xsT2Zmc2V0IC0gcHJldkhlaWdodCA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuYm91bmRzUmVhY2hlZCA9IEJvdW5kcy5QUkVWO1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uID0gcHJldkhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdTb3VyY2UgPSBTcHJpbmdTb3VyY2UuUFJFVkJPVU5EUztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmFsaWdubWVudCkge1xuICAgICAgICBpZiAocHJldkhlaWdodCAhPT0gdW5kZWZpbmVkICYmIHNjcm9sbE9mZnNldCAtIHByZXZIZWlnaHQgPj0gLXNpemVbdGhpcy5fZGlyZWN0aW9uXSkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPSBCb3VuZHMuUFJFVjtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IC1zaXplW3RoaXMuX2RpcmVjdGlvbl0gKyBwcmV2SGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1NvdXJjZSA9IFNwcmluZ1NvdXJjZS5QUkVWQk9VTkRTO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG5leHRCb3VuZHMgPSBlbmZvcmVNaW5TaXplID8gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dIDogdGhpcy5fY2FsY1Njcm9sbEhlaWdodCh0cnVlLCB0cnVlKTtcbiAgICAgICAgaWYgKG5leHRIZWlnaHQgIT09IHVuZGVmaW5lZCAmJiBzY3JvbGxPZmZzZXQgKyBuZXh0SGVpZ2h0IDw9IG5leHRCb3VuZHMpIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkID0gQm91bmRzLk5FWFQ7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gPSBuZXh0Qm91bmRzIC0gbmV4dEhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdTb3VyY2UgPSBTcHJpbmdTb3VyY2UuTkVYVEJPVU5EUztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9zY3JvbGwuYm91bmRzUmVhY2hlZCA9IEJvdW5kcy5OT05FO1xuICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLk5PTkU7XG59XG5mdW5jdGlvbiBfY2FsY1Njcm9sbFRvT2Zmc2V0KHNpemUsIHNjcm9sbE9mZnNldCkge1xuICAgIHZhciBzY3JvbGxUb1JlbmRlck5vZGUgPSB0aGlzLl9zY3JvbGwuc2Nyb2xsVG9SZW5kZXJOb2RlIHx8IHRoaXMuX3Njcm9sbC5lbnN1cmVWaXNpYmxlUmVuZGVyTm9kZTtcbiAgICBpZiAoIXNjcm9sbFRvUmVuZGVyTm9kZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl9zY3JvbGwuYm91bmRzUmVhY2hlZCA9PT0gQm91bmRzLkJPVEggfHwgIXRoaXMuX3Njcm9sbC5zY3JvbGxUb0RpcmVjdGlvbiAmJiB0aGlzLl9zY3JvbGwuYm91bmRzUmVhY2hlZCA9PT0gQm91bmRzLlBSRVYgfHwgdGhpcy5fc2Nyb2xsLnNjcm9sbFRvRGlyZWN0aW9uICYmIHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkID09PSBCb3VuZHMuTkVYVCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBmb3VuZE5vZGU7XG4gICAgdmFyIHNjcm9sbFRvT2Zmc2V0ID0gMDtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUodHJ1ZSk7XG4gICAgdmFyIGNvdW50ID0gMDtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBjb3VudCsrO1xuICAgICAgICBpZiAoIW5vZGUuX2ludmFsaWRhdGVkIHx8IG5vZGUuc2Nyb2xsTGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICBzY3JvbGxUb09mZnNldCAtPSBub2RlLnNjcm9sbExlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZS5yZW5kZXJOb2RlID09PSBzY3JvbGxUb1JlbmRlck5vZGUpIHtcbiAgICAgICAgICAgIGZvdW5kTm9kZSA9IG5vZGU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgICAgIHNjcm9sbFRvT2Zmc2V0IC09IG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgIH1cbiAgICBpZiAoIWZvdW5kTm9kZSkge1xuICAgICAgICBzY3JvbGxUb09mZnNldCA9IDA7XG4gICAgICAgIG5vZGUgPSB0aGlzLl9ub2Rlcy5nZXRTdGFydEVudW1Ob2RlKGZhbHNlKTtcbiAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgIGlmICghbm9kZS5faW52YWxpZGF0ZWQgfHwgbm9kZS5zY3JvbGxMZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsVG9PZmZzZXQgKz0gbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm9kZS5yZW5kZXJOb2RlID09PSBzY3JvbGxUb1JlbmRlck5vZGUpIHtcbiAgICAgICAgICAgICAgICBmb3VuZE5vZGUgPSBub2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxUb09mZnNldCArPSBub2RlLnNjcm9sbExlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vZGUgPSBub2RlLl9wcmV2O1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChmb3VuZE5vZGUpIHtcbiAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5lbnN1cmVWaXNpYmxlU2VxdWVuY2UpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbFRvT2Zmc2V0IC0gZm91bmROb2RlLnNjcm9sbExlbmd0aCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uID0gc2Nyb2xsVG9PZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdTb3VyY2UgPSBTcHJpbmdTb3VyY2UuRU5TVVJFVklTSUJMRTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNjcm9sbFRvT2Zmc2V0ID4gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IHNpemVbdGhpcy5fZGlyZWN0aW9uXSAtIHNjcm9sbFRvT2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLkVOU1VSRVZJU0lCTEU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmVuc3VyZVZpc2libGVSZW5kZXJOb2RlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsVG9PZmZzZXQgPSAtc2Nyb2xsVG9PZmZzZXQ7XG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbFRvT2Zmc2V0IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gPSBzY3JvbGxUb09mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1NvdXJjZSA9IFNwcmluZ1NvdXJjZS5FTlNVUkVWSVNJQkxFO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2Nyb2xsVG9PZmZzZXQgKyBmb3VuZE5vZGUuc2Nyb2xsTGVuZ3RoID4gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IHNpemVbdGhpcy5fZGlyZWN0aW9uXSAtIChzY3JvbGxUb09mZnNldCArIGZvdW5kTm9kZS5zY3JvbGxMZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLkVOU1VSRVZJU0lCTEU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmVuc3VyZVZpc2libGVSZW5kZXJOb2RlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IHNjcm9sbFRvT2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1NvdXJjZSA9IFNwcmluZ1NvdXJjZS5HT1RPU0VRVUVOQ0U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5fc2Nyb2xsLnNjcm9sbFRvRGlyZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IHNjcm9sbE9mZnNldCAtIHNpemVbdGhpcy5fZGlyZWN0aW9uXTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1NvdXJjZSA9IFNwcmluZ1NvdXJjZS5HT1RPTkVYVERJUkVDVElPTjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gPSBzY3JvbGxPZmZzZXQgKyBzaXplW3RoaXMuX2RpcmVjdGlvbl07XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdTb3VyY2UgPSBTcHJpbmdTb3VyY2UuR09UT1BSRVZESVJFQ1RJT047XG4gICAgfVxuICAgIGlmICh0aGlzLl92aWV3U2VxdWVuY2UuY2xlYW51cCkge1xuICAgICAgICB2YXIgdmlld1NlcXVlbmNlID0gdGhpcy5fdmlld1NlcXVlbmNlO1xuICAgICAgICB3aGlsZSAodmlld1NlcXVlbmNlLmdldCgpICE9PSBzY3JvbGxUb1JlbmRlck5vZGUpIHtcbiAgICAgICAgICAgIHZpZXdTZXF1ZW5jZSA9IHRoaXMuX3Njcm9sbC5zY3JvbGxUb0RpcmVjdGlvbiA/IHZpZXdTZXF1ZW5jZS5nZXROZXh0KHRydWUpIDogdmlld1NlcXVlbmNlLmdldFByZXZpb3VzKHRydWUpO1xuICAgICAgICAgICAgaWYgKCF2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIF9zbmFwVG9QYWdlKCkge1xuICAgIGlmICghdGhpcy5vcHRpb25zLnBhZ2luYXRlZCB8fCB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VDb3VudCB8fCB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpdGVtO1xuICAgIHN3aXRjaCAodGhpcy5vcHRpb25zLnBhZ2luYXRpb25Nb2RlKSB7XG4gICAgY2FzZSBQYWdpbmF0aW9uTW9kZS5TQ1JPTEw6XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnBhZ2luYXRpb25FbmVyZ3lUaHJlc3Nob2xkIHx8IE1hdGguYWJzKHRoaXMuX3Njcm9sbC5wYXJ0aWNsZS5nZXRFbmVyZ3koKSkgPD0gdGhpcy5vcHRpb25zLnBhZ2luYXRpb25FbmVyZ3lUaHJlc3Nob2xkKSB7XG4gICAgICAgICAgICBpdGVtID0gdGhpcy5vcHRpb25zLmFsaWdubWVudCA/IHRoaXMuZ2V0TGFzdFZpc2libGVJdGVtKCkgOiB0aGlzLmdldEZpcnN0VmlzaWJsZUl0ZW0oKTtcbiAgICAgICAgICAgIGlmIChpdGVtICYmIGl0ZW0ucmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ29Ub1JlbmRlck5vZGUoaXRlbS5yZW5kZXJOb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICBjYXNlIFBhZ2luYXRpb25Nb2RlLlBBR0U6XG4gICAgICAgIGl0ZW0gPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gdGhpcy5nZXRMYXN0VmlzaWJsZUl0ZW0oKSA6IHRoaXMuZ2V0Rmlyc3RWaXNpYmxlSXRlbSgpO1xuICAgICAgICBpZiAoaXRlbSAmJiBpdGVtLnJlbmRlck5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuZ29Ub1JlbmRlck5vZGUoaXRlbS5yZW5kZXJOb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG59XG5mdW5jdGlvbiBfbm9ybWFsaXplUHJldlZpZXdTZXF1ZW5jZShzY3JvbGxPZmZzZXQpIHtcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIHZhciBub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ID0gc2Nyb2xsT2Zmc2V0O1xuICAgIHZhciBub3JtYWxpemVOZXh0UHJldiA9IGZhbHNlO1xuICAgIHZhciBub2RlID0gdGhpcy5fbm9kZXMuZ2V0U3RhcnRFbnVtTm9kZShmYWxzZSk7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKCFub2RlLl9pbnZhbGlkYXRlZCB8fCAhbm9kZS5fdmlld1NlcXVlbmNlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9ybWFsaXplTmV4dFByZXYpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdTZXF1ZW5jZSA9IG5vZGUuX3ZpZXdTZXF1ZW5jZTtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gICAgICAgICAgICBub3JtYWxpemVOZXh0UHJldiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLnNjcm9sbExlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IG5vZGUudHJ1ZVNpemVSZXF1ZXN0ZWQgfHwgc2Nyb2xsT2Zmc2V0IDwgMCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc2Nyb2xsT2Zmc2V0IC09IG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICBjb3VudCsrO1xuICAgICAgICBpZiAobm9kZS5zY3JvbGxMZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICAgICAgbm9ybWFsaXplTmV4dFByZXYgPSBzY3JvbGxPZmZzZXQgPj0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdmlld1NlcXVlbmNlID0gbm9kZS5fdmlld1NlcXVlbmNlO1xuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbm9kZSA9IG5vZGUuX3ByZXY7XG4gICAgfVxuICAgIHJldHVybiBub3JtYWxpemVkU2Nyb2xsT2Zmc2V0O1xufVxuZnVuY3Rpb24gX25vcm1hbGl6ZU5leHRWaWV3U2VxdWVuY2Uoc2Nyb2xsT2Zmc2V0KSB7XG4gICAgdmFyIGNvdW50ID0gMDtcbiAgICB2YXIgbm9ybWFsaXplZFNjcm9sbE9mZnNldCA9IHNjcm9sbE9mZnNldDtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUodHJ1ZSk7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKCFub2RlLl9pbnZhbGlkYXRlZCB8fCBub2RlLnNjcm9sbExlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IG5vZGUudHJ1ZVNpemVSZXF1ZXN0ZWQgfHwgIW5vZGUuX3ZpZXdTZXF1ZW5jZSB8fCBzY3JvbGxPZmZzZXQgPiAwICYmICghdGhpcy5vcHRpb25zLmFsaWdubWVudCB8fCBub2RlLnNjcm9sbExlbmd0aCAhPT0gMCkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICBzY3JvbGxPZmZzZXQgKz0gbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLnNjcm9sbExlbmd0aCB8fCB0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICB0aGlzLl92aWV3U2VxdWVuY2UgPSBub2RlLl92aWV3U2VxdWVuY2U7XG4gICAgICAgICAgICBub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ID0gc2Nyb2xsT2Zmc2V0O1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmFsaWdubWVudCkge1xuICAgICAgICAgICAgc2Nyb2xsT2Zmc2V0ICs9IG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICB9XG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQ7XG59XG5mdW5jdGlvbiBfbm9ybWFsaXplVmlld1NlcXVlbmNlKHNpemUsIHNjcm9sbE9mZnNldCkge1xuICAgIHZhciBjYXBzID0gdGhpcy5fbGF5b3V0LmNhcGFiaWxpdGllcztcbiAgICBpZiAoY2FwcyAmJiBjYXBzLmRlYnVnICYmIGNhcHMuZGVidWcubm9ybWFsaXplICE9PSB1bmRlZmluZWQgJiYgIWNhcHMuZGVidWcubm9ybWFsaXplKSB7XG4gICAgICAgIHJldHVybiBzY3JvbGxPZmZzZXQ7XG4gICAgfVxuICAgIGlmICh0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VDb3VudCkge1xuICAgICAgICByZXR1cm4gc2Nyb2xsT2Zmc2V0O1xuICAgIH1cbiAgICB2YXIgbm9ybWFsaXplZFNjcm9sbE9mZnNldCA9IHNjcm9sbE9mZnNldDtcbiAgICBpZiAodGhpcy5vcHRpb25zLmFsaWdubWVudCAmJiBzY3JvbGxPZmZzZXQgPCAwKSB7XG4gICAgICAgIG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgPSBfbm9ybWFsaXplTmV4dFZpZXdTZXF1ZW5jZS5jYWxsKHRoaXMsIHNjcm9sbE9mZnNldCk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5vcHRpb25zLmFsaWdubWVudCAmJiBzY3JvbGxPZmZzZXQgPiAwKSB7XG4gICAgICAgIG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgPSBfbm9ybWFsaXplUHJldlZpZXdTZXF1ZW5jZS5jYWxsKHRoaXMsIHNjcm9sbE9mZnNldCk7XG4gICAgfVxuICAgIGlmIChub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ID09PSBzY3JvbGxPZmZzZXQpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgJiYgc2Nyb2xsT2Zmc2V0ID4gMCkge1xuICAgICAgICAgICAgbm9ybWFsaXplZFNjcm9sbE9mZnNldCA9IF9ub3JtYWxpemVQcmV2Vmlld1NlcXVlbmNlLmNhbGwodGhpcywgc2Nyb2xsT2Zmc2V0KTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5vcHRpb25zLmFsaWdubWVudCAmJiBzY3JvbGxPZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICBub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ID0gX25vcm1hbGl6ZU5leHRWaWV3U2VxdWVuY2UuY2FsbCh0aGlzLCBzY3JvbGxPZmZzZXQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ICE9PSBzY3JvbGxPZmZzZXQpIHtcbiAgICAgICAgdmFyIGRlbHRhID0gbm9ybWFsaXplZFNjcm9sbE9mZnNldCAtIHNjcm9sbE9mZnNldDtcbiAgICAgICAgdmFyIHBhcnRpY2xlVmFsdWUgPSB0aGlzLl9zY3JvbGwucGFydGljbGUuZ2V0UG9zaXRpb24xRCgpO1xuICAgICAgICBfc2V0UGFydGljbGUuY2FsbCh0aGlzLCBwYXJ0aWNsZVZhbHVlICsgZGVsdGEsIHVuZGVmaW5lZCwgJ25vcm1hbGl6ZScpO1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiArPSBkZWx0YTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FwcyAmJiBjYXBzLnNlcXVlbnRpYWxTY3JvbGxpbmdPcHRpbWl6ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5ncm91cFN0YXJ0IC09IGRlbHRhO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBub3JtYWxpemVkU2Nyb2xsT2Zmc2V0O1xufVxuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0VmlzaWJsZUl0ZW1zID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzaXplID0gdGhpcy5fY29udGV4dFNpemVDYWNoZTtcbiAgICB2YXIgc2Nyb2xsT2Zmc2V0ID0gdGhpcy5vcHRpb25zLmFsaWdubWVudCA/IHRoaXMuX3Njcm9sbC51bm5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgKyBzaXplW3RoaXMuX2RpcmVjdGlvbl0gOiB0aGlzLl9zY3JvbGwudW5ub3JtYWxpemVkU2Nyb2xsT2Zmc2V0O1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUodHJ1ZSk7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKCFub2RlLl9pbnZhbGlkYXRlZCB8fCBub2RlLnNjcm9sbExlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IHNjcm9sbE9mZnNldCA+IHNpemVbdGhpcy5fZGlyZWN0aW9uXSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc2Nyb2xsT2Zmc2V0ICs9IG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICBpZiAoc2Nyb2xsT2Zmc2V0ID49IDAgJiYgbm9kZS5fdmlld1NlcXVlbmNlKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgaW5kZXg6IG5vZGUuX3ZpZXdTZXF1ZW5jZS5nZXRJbmRleCgpLFxuICAgICAgICAgICAgICAgIHZpZXdTZXF1ZW5jZTogbm9kZS5fdmlld1NlcXVlbmNlLFxuICAgICAgICAgICAgICAgIHJlbmRlck5vZGU6IG5vZGUucmVuZGVyTm9kZSxcbiAgICAgICAgICAgICAgICB2aXNpYmxlUGVyYzogbm9kZS5zY3JvbGxMZW5ndGggPyAoTWF0aC5taW4oc2Nyb2xsT2Zmc2V0LCBzaXplW3RoaXMuX2RpcmVjdGlvbl0pIC0gTWF0aC5tYXgoc2Nyb2xsT2Zmc2V0IC0gbm9kZS5zY3JvbGxMZW5ndGgsIDApKSAvIG5vZGUuc2Nyb2xsTGVuZ3RoIDogMSxcbiAgICAgICAgICAgICAgICBzY3JvbGxPZmZzZXQ6IHNjcm9sbE9mZnNldCAtIG5vZGUuc2Nyb2xsTGVuZ3RoLFxuICAgICAgICAgICAgICAgIHNjcm9sbExlbmd0aDogbm9kZS5zY3JvbGxMZW5ndGgsXG4gICAgICAgICAgICAgICAgX25vZGU6IG5vZGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgIH1cbiAgICBzY3JvbGxPZmZzZXQgPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gdGhpcy5fc2Nyb2xsLnVubm9ybWFsaXplZFNjcm9sbE9mZnNldCArIHNpemVbdGhpcy5fZGlyZWN0aW9uXSA6IHRoaXMuX3Njcm9sbC51bm5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQ7XG4gICAgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUoZmFsc2UpO1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmICghbm9kZS5faW52YWxpZGF0ZWQgfHwgbm9kZS5zY3JvbGxMZW5ndGggPT09IHVuZGVmaW5lZCB8fCBzY3JvbGxPZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzY3JvbGxPZmZzZXQgLT0gbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgIGlmIChzY3JvbGxPZmZzZXQgPCBzaXplW3RoaXMuX2RpcmVjdGlvbl0gJiYgbm9kZS5fdmlld1NlcXVlbmNlKSB7XG4gICAgICAgICAgICByZXN1bHQudW5zaGlmdCh7XG4gICAgICAgICAgICAgICAgaW5kZXg6IG5vZGUuX3ZpZXdTZXF1ZW5jZS5nZXRJbmRleCgpLFxuICAgICAgICAgICAgICAgIHZpZXdTZXF1ZW5jZTogbm9kZS5fdmlld1NlcXVlbmNlLFxuICAgICAgICAgICAgICAgIHJlbmRlck5vZGU6IG5vZGUucmVuZGVyTm9kZSxcbiAgICAgICAgICAgICAgICB2aXNpYmxlUGVyYzogbm9kZS5zY3JvbGxMZW5ndGggPyAoTWF0aC5taW4oc2Nyb2xsT2Zmc2V0ICsgbm9kZS5zY3JvbGxMZW5ndGgsIHNpemVbdGhpcy5fZGlyZWN0aW9uXSkgLSBNYXRoLm1heChzY3JvbGxPZmZzZXQsIDApKSAvIG5vZGUuc2Nyb2xsTGVuZ3RoIDogMSxcbiAgICAgICAgICAgICAgICBzY3JvbGxPZmZzZXQ6IHNjcm9sbE9mZnNldCxcbiAgICAgICAgICAgICAgICBzY3JvbGxMZW5ndGg6IG5vZGUuc2Nyb2xsTGVuZ3RoLFxuICAgICAgICAgICAgICAgIF9ub2RlOiBub2RlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5fcHJldjtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5nZXRGaXJzdFZpc2libGVJdGVtID0gZnVuY3Rpb24gKGluY2x1ZGVOb2RlKSB7XG4gICAgdmFyIHNpemUgPSB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlO1xuICAgIHZhciBzY3JvbGxPZmZzZXQgPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gdGhpcy5fc2Nyb2xsLnVubm9ybWFsaXplZFNjcm9sbE9mZnNldCArIHNpemVbdGhpcy5fZGlyZWN0aW9uXSA6IHRoaXMuX3Njcm9sbC51bm5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQ7XG4gICAgdmFyIG5vZGUgPSB0aGlzLl9ub2Rlcy5nZXRTdGFydEVudW1Ob2RlKHRydWUpO1xuICAgIHZhciBub2RlRm91bmRWaXNpYmxlUGVyYztcbiAgICB2YXIgbm9kZUZvdW5kU2Nyb2xsT2Zmc2V0O1xuICAgIHZhciBub2RlRm91bmQ7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKCFub2RlLl9pbnZhbGlkYXRlZCB8fCBub2RlLnNjcm9sbExlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IHNjcm9sbE9mZnNldCA+IHNpemVbdGhpcy5fZGlyZWN0aW9uXSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc2Nyb2xsT2Zmc2V0ICs9IG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICBpZiAoc2Nyb2xsT2Zmc2V0ID49IDAgJiYgbm9kZS5fdmlld1NlcXVlbmNlKSB7XG4gICAgICAgICAgICBub2RlRm91bmRWaXNpYmxlUGVyYyA9IG5vZGUuc2Nyb2xsTGVuZ3RoID8gKE1hdGgubWluKHNjcm9sbE9mZnNldCwgc2l6ZVt0aGlzLl9kaXJlY3Rpb25dKSAtIE1hdGgubWF4KHNjcm9sbE9mZnNldCAtIG5vZGUuc2Nyb2xsTGVuZ3RoLCAwKSkgLyBub2RlLnNjcm9sbExlbmd0aCA6IDE7XG4gICAgICAgICAgICBub2RlRm91bmRTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQgLSBub2RlLnNjcm9sbExlbmd0aDtcbiAgICAgICAgICAgIGlmIChub2RlRm91bmRWaXNpYmxlUGVyYyA+PSB0aGlzLm9wdGlvbnMudmlzaWJsZUl0ZW1UaHJlc3Nob2xkIHx8IG5vZGVGb3VuZFNjcm9sbE9mZnNldCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgbm9kZUZvdW5kID0gbm9kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICB9XG4gICAgc2Nyb2xsT2Zmc2V0ID0gdGhpcy5vcHRpb25zLmFsaWdubWVudCA/IHRoaXMuX3Njcm9sbC51bm5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgKyBzaXplW3RoaXMuX2RpcmVjdGlvbl0gOiB0aGlzLl9zY3JvbGwudW5ub3JtYWxpemVkU2Nyb2xsT2Zmc2V0O1xuICAgIG5vZGUgPSB0aGlzLl9ub2Rlcy5nZXRTdGFydEVudW1Ob2RlKGZhbHNlKTtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBpZiAoIW5vZGUuX2ludmFsaWRhdGVkIHx8IG5vZGUuc2Nyb2xsTGVuZ3RoID09PSB1bmRlZmluZWQgfHwgc2Nyb2xsT2Zmc2V0IDwgMCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc2Nyb2xsT2Zmc2V0IC09IG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICBpZiAoc2Nyb2xsT2Zmc2V0IDwgc2l6ZVt0aGlzLl9kaXJlY3Rpb25dICYmIG5vZGUuX3ZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgdmFyIHZpc2libGVQZXJjID0gbm9kZS5zY3JvbGxMZW5ndGggPyAoTWF0aC5taW4oc2Nyb2xsT2Zmc2V0ICsgbm9kZS5zY3JvbGxMZW5ndGgsIHNpemVbdGhpcy5fZGlyZWN0aW9uXSkgLSBNYXRoLm1heChzY3JvbGxPZmZzZXQsIDApKSAvIG5vZGUuc2Nyb2xsTGVuZ3RoIDogMTtcbiAgICAgICAgICAgIGlmICh2aXNpYmxlUGVyYyA+PSB0aGlzLm9wdGlvbnMudmlzaWJsZUl0ZW1UaHJlc3Nob2xkIHx8IHNjcm9sbE9mZnNldCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgbm9kZUZvdW5kVmlzaWJsZVBlcmMgPSB2aXNpYmxlUGVyYztcbiAgICAgICAgICAgICAgICBub2RlRm91bmRTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gICAgICAgICAgICAgICAgbm9kZUZvdW5kID0gbm9kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5fcHJldjtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVGb3VuZCA/IHtcbiAgICAgICAgaW5kZXg6IG5vZGVGb3VuZC5fdmlld1NlcXVlbmNlLmdldEluZGV4KCksXG4gICAgICAgIHZpZXdTZXF1ZW5jZTogbm9kZUZvdW5kLl92aWV3U2VxdWVuY2UsXG4gICAgICAgIHJlbmRlck5vZGU6IG5vZGVGb3VuZC5yZW5kZXJOb2RlLFxuICAgICAgICB2aXNpYmxlUGVyYzogbm9kZUZvdW5kVmlzaWJsZVBlcmMsXG4gICAgICAgIHNjcm9sbE9mZnNldDogbm9kZUZvdW5kU2Nyb2xsT2Zmc2V0LFxuICAgICAgICBzY3JvbGxMZW5ndGg6IG5vZGVGb3VuZC5zY3JvbGxMZW5ndGgsXG4gICAgICAgIF9ub2RlOiBub2RlRm91bmRcbiAgICB9IDogdW5kZWZpbmVkO1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmdldExhc3RWaXNpYmxlSXRlbSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaXRlbXMgPSB0aGlzLmdldFZpc2libGVJdGVtcygpO1xuICAgIHZhciBzaXplID0gdGhpcy5fY29udGV4dFNpemVDYWNoZTtcbiAgICBmb3IgKHZhciBpID0gaXRlbXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdmFyIGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAgICAgaWYgKGl0ZW0udmlzaWJsZVBlcmMgPj0gdGhpcy5vcHRpb25zLnZpc2libGVJdGVtVGhyZXNzaG9sZCB8fCBpdGVtLnNjcm9sbE9mZnNldCArIGl0ZW0uc2Nyb2xsTGVuZ3RoIDw9IHNpemVbdGhpcy5fZGlyZWN0aW9uXSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGl0ZW1zLmxlbmd0aCA/IGl0ZW1zW2l0ZW1zLmxlbmd0aCAtIDFdIDogdW5kZWZpbmVkO1xufTtcbmZ1bmN0aW9uIF9zY3JvbGxUb1NlcXVlbmNlKHZpZXdTZXF1ZW5jZSwgbmV4dCkge1xuICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxUb1NlcXVlbmNlID0gdmlld1NlcXVlbmNlO1xuICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxUb1JlbmRlck5vZGUgPSB2aWV3U2VxdWVuY2UuZ2V0KCk7XG4gICAgdGhpcy5fc2Nyb2xsLmVuc3VyZVZpc2libGVSZW5kZXJOb2RlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxUb0RpcmVjdGlvbiA9IG5leHQ7XG4gICAgdGhpcy5fc2Nyb2xsLnNjcm9sbERpcnR5ID0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIF9lbnN1cmVWaXNpYmxlU2VxdWVuY2Uodmlld1NlcXVlbmNlLCBuZXh0KSB7XG4gICAgdGhpcy5fc2Nyb2xsLnNjcm9sbFRvU2VxdWVuY2UgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fc2Nyb2xsLnNjcm9sbFRvUmVuZGVyTm9kZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9zY3JvbGwuZW5zdXJlVmlzaWJsZVJlbmRlck5vZGUgPSB2aWV3U2VxdWVuY2UuZ2V0KCk7XG4gICAgdGhpcy5fc2Nyb2xsLnNjcm9sbFRvRGlyZWN0aW9uID0gbmV4dDtcbiAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRGlydHkgPSB0cnVlO1xufVxuZnVuY3Rpb24gX2dvVG9QYWdlKGFtb3VudCkge1xuICAgIHZhciB2aWV3U2VxdWVuY2UgPSB0aGlzLl9zY3JvbGwuc2Nyb2xsVG9TZXF1ZW5jZSB8fCB0aGlzLl92aWV3U2VxdWVuY2U7XG4gICAgaWYgKCF0aGlzLl9zY3JvbGwuc2Nyb2xsVG9TZXF1ZW5jZSkge1xuICAgICAgICB2YXIgZmlyc3RWaXNpYmxlSXRlbSA9IHRoaXMuZ2V0Rmlyc3RWaXNpYmxlSXRlbSgpO1xuICAgICAgICBpZiAoZmlyc3RWaXNpYmxlSXRlbSkge1xuICAgICAgICAgICAgdmlld1NlcXVlbmNlID0gZmlyc3RWaXNpYmxlSXRlbS52aWV3U2VxdWVuY2U7XG4gICAgICAgICAgICBpZiAoYW1vdW50IDwgMCAmJiBmaXJzdFZpc2libGVJdGVtLnNjcm9sbE9mZnNldCA8IDAgfHwgYW1vdW50ID4gMCAmJiBmaXJzdFZpc2libGVJdGVtLnNjcm9sbE9mZnNldCA+IDApIHtcbiAgICAgICAgICAgICAgICBhbW91bnQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghdmlld1NlcXVlbmNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBNYXRoLmFicyhhbW91bnQpOyBpKyspIHtcbiAgICAgICAgdmFyIG5leHRWaWV3U2VxdWVuY2UgPSBhbW91bnQgPiAwID8gdmlld1NlcXVlbmNlLmdldE5leHQoKSA6IHZpZXdTZXF1ZW5jZS5nZXRQcmV2aW91cygpO1xuICAgICAgICBpZiAobmV4dFZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgdmlld1NlcXVlbmNlID0gbmV4dFZpZXdTZXF1ZW5jZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9zY3JvbGxUb1NlcXVlbmNlLmNhbGwodGhpcywgdmlld1NlcXVlbmNlLCBhbW91bnQgPj0gMCk7XG59XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5nb1RvRmlyc3RQYWdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5fdmlld1NlcXVlbmNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpZiAodGhpcy5fdmlld1NlcXVlbmNlLl8gJiYgdGhpcy5fdmlld1NlcXVlbmNlLl8ubG9vcCkge1xuICAgICAgICBMYXlvdXRVdGlsaXR5LmVycm9yKCdVbmFibGUgdG8gZ28gdG8gZmlyc3QgaXRlbSBvZiBsb29wZWQgVmlld1NlcXVlbmNlJyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB2YXIgdmlld1NlcXVlbmNlID0gdGhpcy5fdmlld1NlcXVlbmNlO1xuICAgIHdoaWxlICh2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgdmFyIHByZXYgPSB2aWV3U2VxdWVuY2UuZ2V0UHJldmlvdXMoKTtcbiAgICAgICAgaWYgKHByZXYgJiYgcHJldi5nZXQoKSkge1xuICAgICAgICAgICAgdmlld1NlcXVlbmNlID0gcHJldjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9zY3JvbGxUb1NlcXVlbmNlLmNhbGwodGhpcywgdmlld1NlcXVlbmNlLCBmYWxzZSk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuZ29Ub1ByZXZpb3VzUGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBfZ29Ub1BhZ2UuY2FsbCh0aGlzLCAtMSk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuZ29Ub05leHRQYWdlID0gZnVuY3Rpb24gKCkge1xuICAgIF9nb1RvUGFnZS5jYWxsKHRoaXMsIDEpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmdvVG9MYXN0UGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX3ZpZXdTZXF1ZW5jZSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgaWYgKHRoaXMuX3ZpZXdTZXF1ZW5jZS5fICYmIHRoaXMuX3ZpZXdTZXF1ZW5jZS5fLmxvb3ApIHtcbiAgICAgICAgTGF5b3V0VXRpbGl0eS5lcnJvcignVW5hYmxlIHRvIGdvIHRvIGxhc3QgaXRlbSBvZiBsb29wZWQgVmlld1NlcXVlbmNlJyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB2YXIgdmlld1NlcXVlbmNlID0gdGhpcy5fdmlld1NlcXVlbmNlO1xuICAgIHdoaWxlICh2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgdmFyIG5leHQgPSB2aWV3U2VxdWVuY2UuZ2V0TmV4dCgpO1xuICAgICAgICBpZiAobmV4dCAmJiBuZXh0LmdldCgpKSB7XG4gICAgICAgICAgICB2aWV3U2VxdWVuY2UgPSBuZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX3Njcm9sbFRvU2VxdWVuY2UuY2FsbCh0aGlzLCB2aWV3U2VxdWVuY2UsIHRydWUpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmdvVG9SZW5kZXJOb2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICBpZiAoIXRoaXMuX3ZpZXdTZXF1ZW5jZSB8fCAhbm9kZSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgaWYgKHRoaXMuX3ZpZXdTZXF1ZW5jZS5nZXQoKSA9PT0gbm9kZSkge1xuICAgICAgICB2YXIgbmV4dCA9IF9jYWxjU2Nyb2xsT2Zmc2V0LmNhbGwodGhpcykgPj0gMDtcbiAgICAgICAgX3Njcm9sbFRvU2VxdWVuY2UuY2FsbCh0aGlzLCB0aGlzLl92aWV3U2VxdWVuY2UsIG5leHQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdmFyIG5leHRTZXF1ZW5jZSA9IHRoaXMuX3ZpZXdTZXF1ZW5jZS5nZXROZXh0KCk7XG4gICAgdmFyIHByZXZTZXF1ZW5jZSA9IHRoaXMuX3ZpZXdTZXF1ZW5jZS5nZXRQcmV2aW91cygpO1xuICAgIHdoaWxlICgobmV4dFNlcXVlbmNlIHx8IHByZXZTZXF1ZW5jZSkgJiYgbmV4dFNlcXVlbmNlICE9PSB0aGlzLl92aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgdmFyIG5leHROb2RlID0gbmV4dFNlcXVlbmNlID8gbmV4dFNlcXVlbmNlLmdldCgpIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAobmV4dE5vZGUgPT09IG5vZGUpIHtcbiAgICAgICAgICAgIF9zY3JvbGxUb1NlcXVlbmNlLmNhbGwodGhpcywgbmV4dFNlcXVlbmNlLCB0cnVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwcmV2Tm9kZSA9IHByZXZTZXF1ZW5jZSA/IHByZXZTZXF1ZW5jZS5nZXQoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHByZXZOb2RlID09PSBub2RlKSB7XG4gICAgICAgICAgICBfc2Nyb2xsVG9TZXF1ZW5jZS5jYWxsKHRoaXMsIHByZXZTZXF1ZW5jZSwgZmFsc2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dFNlcXVlbmNlID0gbmV4dE5vZGUgPyBuZXh0U2VxdWVuY2UuZ2V0TmV4dCgpIDogdW5kZWZpbmVkO1xuICAgICAgICBwcmV2U2VxdWVuY2UgPSBwcmV2Tm9kZSA/IHByZXZTZXF1ZW5jZS5nZXRQcmV2aW91cygpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5lbnN1cmVWaXNpYmxlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIFZpZXdTZXF1ZW5jZSkge1xuICAgICAgICBub2RlID0gbm9kZS5nZXQoKTtcbiAgICB9IGVsc2UgaWYgKG5vZGUgaW5zdGFuY2VvZiBOdW1iZXIgfHwgdHlwZW9mIG5vZGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHZhciB2aWV3U2VxdWVuY2UgPSB0aGlzLl92aWV3U2VxdWVuY2U7XG4gICAgICAgIHdoaWxlICh2aWV3U2VxdWVuY2UuZ2V0SW5kZXgoKSA8IG5vZGUpIHtcbiAgICAgICAgICAgIHZpZXdTZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZS5nZXROZXh0KCk7XG4gICAgICAgICAgICBpZiAoIXZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHdoaWxlICh2aWV3U2VxdWVuY2UuZ2V0SW5kZXgoKSA+IG5vZGUpIHtcbiAgICAgICAgICAgIHZpZXdTZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZS5nZXRQcmV2aW91cygpO1xuICAgICAgICAgICAgaWYgKCF2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5fdmlld1NlcXVlbmNlLmdldCgpID09PSBub2RlKSB7XG4gICAgICAgIHZhciBuZXh0ID0gX2NhbGNTY3JvbGxPZmZzZXQuY2FsbCh0aGlzKSA+PSAwO1xuICAgICAgICBfZW5zdXJlVmlzaWJsZVNlcXVlbmNlLmNhbGwodGhpcywgdGhpcy5fdmlld1NlcXVlbmNlLCBuZXh0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHZhciBuZXh0U2VxdWVuY2UgPSB0aGlzLl92aWV3U2VxdWVuY2UuZ2V0TmV4dCgpO1xuICAgIHZhciBwcmV2U2VxdWVuY2UgPSB0aGlzLl92aWV3U2VxdWVuY2UuZ2V0UHJldmlvdXMoKTtcbiAgICB3aGlsZSAoKG5leHRTZXF1ZW5jZSB8fCBwcmV2U2VxdWVuY2UpICYmIG5leHRTZXF1ZW5jZSAhPT0gdGhpcy5fdmlld1NlcXVlbmNlKSB7XG4gICAgICAgIHZhciBuZXh0Tm9kZSA9IG5leHRTZXF1ZW5jZSA/IG5leHRTZXF1ZW5jZS5nZXQoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKG5leHROb2RlID09PSBub2RlKSB7XG4gICAgICAgICAgICBfZW5zdXJlVmlzaWJsZVNlcXVlbmNlLmNhbGwodGhpcywgbmV4dFNlcXVlbmNlLCB0cnVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwcmV2Tm9kZSA9IHByZXZTZXF1ZW5jZSA/IHByZXZTZXF1ZW5jZS5nZXQoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHByZXZOb2RlID09PSBub2RlKSB7XG4gICAgICAgICAgICBfZW5zdXJlVmlzaWJsZVNlcXVlbmNlLmNhbGwodGhpcywgcHJldlNlcXVlbmNlLCBmYWxzZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBuZXh0U2VxdWVuY2UgPSBuZXh0Tm9kZSA/IG5leHRTZXF1ZW5jZS5nZXROZXh0KCkgOiB1bmRlZmluZWQ7XG4gICAgICAgIHByZXZTZXF1ZW5jZSA9IHByZXZOb2RlID8gcHJldlNlcXVlbmNlLmdldFByZXZpb3VzKCkgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnNjcm9sbCA9IGZ1bmN0aW9uIChkZWx0YSkge1xuICAgIHRoaXMuaGFsdCgpO1xuICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxEZWx0YSArPSBkZWx0YTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5jYW5TY3JvbGwgPSBmdW5jdGlvbiAoZGVsdGEpIHtcbiAgICB2YXIgc2Nyb2xsT2Zmc2V0ID0gX2NhbGNTY3JvbGxPZmZzZXQuY2FsbCh0aGlzKTtcbiAgICB2YXIgcHJldkhlaWdodCA9IHRoaXMuX2NhbGNTY3JvbGxIZWlnaHQoZmFsc2UpO1xuICAgIHZhciBuZXh0SGVpZ2h0ID0gdGhpcy5fY2FsY1Njcm9sbEhlaWdodCh0cnVlKTtcbiAgICB2YXIgdG90YWxIZWlnaHQ7XG4gICAgaWYgKG5leHRIZWlnaHQgIT09IHVuZGVmaW5lZCAmJiBwcmV2SGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdG90YWxIZWlnaHQgPSBwcmV2SGVpZ2h0ICsgbmV4dEhlaWdodDtcbiAgICB9XG4gICAgaWYgKHRvdGFsSGVpZ2h0ICE9PSB1bmRlZmluZWQgJiYgdG90YWxIZWlnaHQgPD0gdGhpcy5fY29udGV4dFNpemVDYWNoZVt0aGlzLl9kaXJlY3Rpb25dKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBpZiAoZGVsdGEgPCAwICYmIG5leHRIZWlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgbmV4dE9mZnNldCA9IHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbdGhpcy5fZGlyZWN0aW9uXSAtIChzY3JvbGxPZmZzZXQgKyBuZXh0SGVpZ2h0KTtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KG5leHRPZmZzZXQsIGRlbHRhKTtcbiAgICB9IGVsc2UgaWYgKGRlbHRhID4gMCAmJiBwcmV2SGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIHByZXZPZmZzZXQgPSAtKHNjcm9sbE9mZnNldCAtIHByZXZIZWlnaHQpO1xuICAgICAgICByZXR1cm4gTWF0aC5taW4ocHJldk9mZnNldCwgZGVsdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGVsdGE7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuaGFsdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsVG9TZXF1ZW5jZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsVG9SZW5kZXJOb2RlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3Njcm9sbC5lbnN1cmVWaXNpYmxlUmVuZGVyTm9kZSA9IHVuZGVmaW5lZDtcbiAgICBfc2V0UGFydGljbGUuY2FsbCh0aGlzLCB1bmRlZmluZWQsIDAsICdoYWx0Jyk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuaXNTY3JvbGxpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Njcm9sbC5pc1Njcm9sbGluZztcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5nZXRCb3VuZHNSZWFjaGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9zY3JvbGwuYm91bmRzUmVhY2hlZDtcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5nZXRWZWxvY2l0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2Nyb2xsLnBhcnRpY2xlLmdldFZlbG9jaXR5MUQoKTtcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5zZXRWZWxvY2l0eSA9IGZ1bmN0aW9uICh2ZWxvY2l0eSkge1xuICAgIHJldHVybiB0aGlzLl9zY3JvbGwucGFydGljbGUuc2V0VmVsb2NpdHkxRCh2ZWxvY2l0eSk7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuYXBwbHlTY3JvbGxGb3JjZSA9IGZ1bmN0aW9uIChkZWx0YSkge1xuICAgIHRoaXMuaGFsdCgpO1xuICAgIGlmICh0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VDb3VudCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VTdGFydEl0ZW0gPSB0aGlzLmFsaWdubWVudCA/IHRoaXMuZ2V0TGFzdFZpc2libGVJdGVtKCkgOiB0aGlzLmdldEZpcnN0VmlzaWJsZUl0ZW0oKTtcbiAgICB9XG4gICAgdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlQ291bnQrKztcbiAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2UgKz0gZGVsdGE7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlU2Nyb2xsRm9yY2UgPSBmdW5jdGlvbiAocHJldkRlbHRhLCBuZXdEZWx0YSkge1xuICAgIHRoaXMuaGFsdCgpO1xuICAgIG5ld0RlbHRhIC09IHByZXZEZWx0YTtcbiAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2UgKz0gbmV3RGVsdGE7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUucmVsZWFzZVNjcm9sbEZvcmNlID0gZnVuY3Rpb24gKGRlbHRhLCB2ZWxvY2l0eSkge1xuICAgIHRoaXMuaGFsdCgpO1xuICAgIGlmICh0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VDb3VudCA9PT0gMSkge1xuICAgICAgICB2YXIgc2Nyb2xsT2Zmc2V0ID0gX2NhbGNTY3JvbGxPZmZzZXQuY2FsbCh0aGlzKTtcbiAgICAgICAgX3NldFBhcnRpY2xlLmNhbGwodGhpcywgc2Nyb2xsT2Zmc2V0LCB2ZWxvY2l0eSwgJ3JlbGVhc2VTY3JvbGxGb3JjZScpO1xuICAgICAgICB0aGlzLl9zY3JvbGwucGUud2FrZSgpO1xuICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2UgPSAwO1xuICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRGlydHkgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlU3RhcnRJdGVtICYmIHRoaXMub3B0aW9ucy5wYWdpbmF0ZWQgJiYgdGhpcy5vcHRpb25zLnBhZ2luYXRpb25Nb2RlID09PSBQYWdpbmF0aW9uTW9kZS5QQUdFKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMuYWxpZ25tZW50ID8gdGhpcy5nZXRMYXN0VmlzaWJsZUl0ZW0oKSA6IHRoaXMuZ2V0Rmlyc3RWaXNpYmxlSXRlbSgpO1xuICAgICAgICAgICAgaWYgKGl0ZW0ucmVuZGVyTm9kZSAhPT0gdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlU3RhcnRJdGVtLnJlbmRlck5vZGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdvVG9SZW5kZXJOb2RlKGl0ZW0ucmVuZGVyTm9kZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5wYWdpbmF0aW9uRW5lcmd5VGhyZXNzaG9sZCAmJiBNYXRoLmFicyh0aGlzLl9zY3JvbGwucGFydGljbGUuZ2V0RW5lcmd5KCkpID49IHRoaXMub3B0aW9ucy5wYWdpbmF0aW9uRW5lcmd5VGhyZXNzaG9sZCkge1xuICAgICAgICAgICAgICAgIHZlbG9jaXR5ID0gdmVsb2NpdHkgfHwgMDtcbiAgICAgICAgICAgICAgICBpZiAodmVsb2NpdHkgPCAwICYmIGl0ZW0uX25vZGUuX25leHQgJiYgaXRlbS5fbm9kZS5fbmV4dC5yZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ29Ub1JlbmRlck5vZGUoaXRlbS5fbm9kZS5fbmV4dC5yZW5kZXJOb2RlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZlbG9jaXR5ID49IDAgJiYgaXRlbS5fbm9kZS5fcHJldiAmJiBpdGVtLl9ub2RlLl9wcmV2LnJlbmRlck5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nb1RvUmVuZGVyTm9kZShpdGVtLl9ub2RlLl9wcmV2LnJlbmRlck5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nb1RvUmVuZGVyTm9kZShpdGVtLnJlbmRlck5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZVN0YXJ0SXRlbSA9IHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2UgLT0gZGVsdGE7XG4gICAgfVxuICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50LS07XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0U3BlYyA9IGZ1bmN0aW9uIChub2RlLCBub3JtYWxpemUpIHtcbiAgICB2YXIgc3BlYyA9IExheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmdldFNwZWMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoc3BlYyAmJiB0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzICYmIHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMuc2VxdWVudGlhbFNjcm9sbGluZ09wdGltaXplZCkge1xuICAgICAgICBzcGVjID0ge1xuICAgICAgICAgICAgb3JpZ2luOiBzcGVjLm9yaWdpbixcbiAgICAgICAgICAgIGFsaWduOiBzcGVjLmFsaWduLFxuICAgICAgICAgICAgb3BhY2l0eTogc3BlYy5vcGFjaXR5LFxuICAgICAgICAgICAgc2l6ZTogc3BlYy5zaXplLFxuICAgICAgICAgICAgcmVuZGVyTm9kZTogc3BlYy5yZW5kZXJOb2RlLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiBzcGVjLnRyYW5zZm9ybVxuICAgICAgICB9O1xuICAgICAgICB2YXIgdHJhbnNsYXRlID0gW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdO1xuICAgICAgICB0cmFuc2xhdGVbdGhpcy5fZGlyZWN0aW9uXSA9IHRoaXMuX3Njcm9sbE9mZnNldENhY2hlICsgdGhpcy5fc2Nyb2xsLmdyb3VwU3RhcnQ7XG4gICAgICAgIHNwZWMudHJhbnNmb3JtID0gVHJhbnNmb3JtLnRoZW5Nb3ZlKHNwZWMudHJhbnNmb3JtLCB0cmFuc2xhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gc3BlYztcbn07XG5mdW5jdGlvbiBfbGF5b3V0KHNpemUsIHNjcm9sbE9mZnNldCwgbmVzdGVkKSB7XG4gICAgdGhpcy5fZGVidWcubGF5b3V0Q291bnQrKztcbiAgICB2YXIgc2Nyb2xsU3RhcnQgPSAwIC0gTWF0aC5tYXgodGhpcy5vcHRpb25zLmV4dHJhQm91bmRzU3BhY2VbMF0sIDEpO1xuICAgIHZhciBzY3JvbGxFbmQgPSBzaXplW3RoaXMuX2RpcmVjdGlvbl0gKyBNYXRoLm1heCh0aGlzLm9wdGlvbnMuZXh0cmFCb3VuZHNTcGFjZVsxXSwgMSk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5sYXlvdXRBbGwpIHtcbiAgICAgICAgc2Nyb2xsU3RhcnQgPSAtMTAwMDAwMDtcbiAgICAgICAgc2Nyb2xsRW5kID0gMTAwMDAwMDtcbiAgICB9XG4gICAgdmFyIGxheW91dENvbnRleHQgPSB0aGlzLl9ub2Rlcy5wcmVwYXJlRm9yTGF5b3V0KHRoaXMuX3ZpZXdTZXF1ZW5jZSwgdGhpcy5fbm9kZXNCeUlkLCB7XG4gICAgICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiB0aGlzLl9kaXJlY3Rpb24sXG4gICAgICAgICAgICByZXZlcnNlOiB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICAgICAgc2Nyb2xsT2Zmc2V0OiB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gc2Nyb2xsT2Zmc2V0ICsgc2l6ZVt0aGlzLl9kaXJlY3Rpb25dIDogc2Nyb2xsT2Zmc2V0LFxuICAgICAgICAgICAgc2Nyb2xsU3RhcnQ6IHNjcm9sbFN0YXJ0LFxuICAgICAgICAgICAgc2Nyb2xsRW5kOiBzY3JvbGxFbmRcbiAgICAgICAgfSk7XG4gICAgaWYgKHRoaXMuX2xheW91dC5fZnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy5fbGF5b3V0Ll9mdW5jdGlvbihsYXlvdXRDb250ZXh0LCB0aGlzLl9sYXlvdXQub3B0aW9ucyk7XG4gICAgfVxuICAgIHRoaXMuX3Njcm9sbC51bm5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gICAgaWYgKHRoaXMuX3Bvc3RMYXlvdXQpIHtcbiAgICAgICAgdGhpcy5fcG9zdExheW91dChzaXplLCBzY3JvbGxPZmZzZXQpO1xuICAgIH1cbiAgICB0aGlzLl9ub2Rlcy5yZW1vdmVOb25JbnZhbGlkYXRlZE5vZGVzKHRoaXMub3B0aW9ucy5yZW1vdmVTcGVjKTtcbiAgICBfY2FsY0JvdW5kcy5jYWxsKHRoaXMsIHNpemUsIHNjcm9sbE9mZnNldCk7XG4gICAgX2NhbGNTY3JvbGxUb09mZnNldC5jYWxsKHRoaXMsIHNpemUsIHNjcm9sbE9mZnNldCk7XG4gICAgX3NuYXBUb1BhZ2UuY2FsbCh0aGlzKTtcbiAgICB2YXIgbmV3U2Nyb2xsT2Zmc2V0ID0gX2NhbGNTY3JvbGxPZmZzZXQuY2FsbCh0aGlzLCB0cnVlKTtcbiAgICBpZiAoIW5lc3RlZCAmJiBuZXdTY3JvbGxPZmZzZXQgIT09IHNjcm9sbE9mZnNldCkge1xuICAgICAgICByZXR1cm4gX2xheW91dC5jYWxsKHRoaXMsIHNpemUsIG5ld1Njcm9sbE9mZnNldCwgdHJ1ZSk7XG4gICAgfVxuICAgIHNjcm9sbE9mZnNldCA9IF9ub3JtYWxpemVWaWV3U2VxdWVuY2UuY2FsbCh0aGlzLCBzaXplLCBzY3JvbGxPZmZzZXQpO1xuICAgIF91cGRhdGVTcHJpbmcuY2FsbCh0aGlzKTtcbiAgICB0aGlzLl9ub2Rlcy5yZW1vdmVWaXJ0dWFsVmlld1NlcXVlbmNlTm9kZXMoKTtcbiAgICByZXR1cm4gc2Nyb2xsT2Zmc2V0O1xufVxuZnVuY3Rpb24gX2lubmVyUmVuZGVyKCkge1xuICAgIHZhciBzcGVjcyA9IHRoaXMuX3NwZWNzO1xuICAgIGZvciAodmFyIGkzID0gMCwgajMgPSBzcGVjcy5sZW5ndGg7IGkzIDwgajM7IGkzKyspIHtcbiAgICAgICAgc3BlY3NbaTNdLnRhcmdldCA9IHNwZWNzW2kzXS5yZW5kZXJOb2RlLnJlbmRlcigpO1xuICAgIH1cbiAgICByZXR1cm4gc3BlY3M7XG59XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5jb21taXQgPSBmdW5jdGlvbiBjb21taXQoY29udGV4dCkge1xuICAgIHZhciBzaXplID0gY29udGV4dC5zaXplO1xuICAgIHRoaXMuX2RlYnVnLmNvbW1pdENvdW50Kys7XG4gICAgdmFyIHNjcm9sbE9mZnNldCA9IF9jYWxjU2Nyb2xsT2Zmc2V0LmNhbGwodGhpcywgdHJ1ZSwgdHJ1ZSk7XG4gICAgaWYgKHRoaXMuX3Njcm9sbE9mZnNldENhY2hlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsT2Zmc2V0Q2FjaGUgPSBzY3JvbGxPZmZzZXQ7XG4gICAgfVxuICAgIHZhciBlbWl0RW5kU2Nyb2xsaW5nRXZlbnQgPSBmYWxzZTtcbiAgICB2YXIgZW1pdFNjcm9sbEV2ZW50ID0gZmFsc2U7XG4gICAgdmFyIGV2ZW50RGF0YTtcbiAgICBpZiAoc2l6ZVswXSAhPT0gdGhpcy5fY29udGV4dFNpemVDYWNoZVswXSB8fCBzaXplWzFdICE9PSB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlWzFdIHx8IHRoaXMuX2lzRGlydHkgfHwgdGhpcy5fc2Nyb2xsLnNjcm9sbERpcnR5IHx8IHRoaXMuX25vZGVzLl90cnVlU2l6ZVJlcXVlc3RlZCB8fCB0aGlzLm9wdGlvbnMuYWx3YXlzTGF5b3V0IHx8IHRoaXMuX3Njcm9sbE9mZnNldENhY2hlICE9PSBzY3JvbGxPZmZzZXQpIHtcbiAgICAgICAgZXZlbnREYXRhID0ge1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICAgICAgb2xkU2l6ZTogdGhpcy5fY29udGV4dFNpemVDYWNoZSxcbiAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICBvbGRTY3JvbGxPZmZzZXQ6IHRoaXMuX3Njcm9sbE9mZnNldENhY2hlLFxuICAgICAgICAgICAgc2Nyb2xsT2Zmc2V0OiBzY3JvbGxPZmZzZXRcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMuX3Njcm9sbE9mZnNldENhY2hlICE9PSBzY3JvbGxPZmZzZXQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fc2Nyb2xsLmlzU2Nyb2xsaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmlzU2Nyb2xsaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdzY3JvbGxzdGFydCcsIGV2ZW50RGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbWl0U2Nyb2xsRXZlbnQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ2xheW91dHN0YXJ0JywgZXZlbnREYXRhKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5mbG93ICYmICh0aGlzLl9pc0RpcnR5IHx8IHRoaXMub3B0aW9ucy5yZWZsb3dPblJlc2l6ZSAmJiAoc2l6ZVswXSAhPT0gdGhpcy5fY29udGV4dFNpemVDYWNoZVswXSB8fCBzaXplWzFdICE9PSB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlWzFdKSkpIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5fbm9kZXMuZ2V0U3RhcnRFbnVtTm9kZSgpO1xuICAgICAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBub2RlLnJlbGVhc2VMb2NrKCk7XG4gICAgICAgICAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY29udGV4dFNpemVDYWNoZVswXSA9IHNpemVbMF07XG4gICAgICAgIHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbMV0gPSBzaXplWzFdO1xuICAgICAgICB0aGlzLl9pc0RpcnR5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxEaXJ0eSA9IGZhbHNlO1xuICAgICAgICBzY3JvbGxPZmZzZXQgPSBfbGF5b3V0LmNhbGwodGhpcywgc2l6ZSwgc2Nyb2xsT2Zmc2V0KTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsT2Zmc2V0Q2FjaGUgPSBzY3JvbGxPZmZzZXQ7XG4gICAgICAgIGV2ZW50RGF0YS5zY3JvbGxPZmZzZXQgPSB0aGlzLl9zY3JvbGxPZmZzZXRDYWNoZTtcbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnbGF5b3V0ZW5kJywgZXZlbnREYXRhKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3Njcm9sbC5pc1Njcm9sbGluZyAmJiAhdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlQ291bnQpIHtcbiAgICAgICAgZW1pdEVuZFNjcm9sbGluZ0V2ZW50ID0gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIGdyb3VwVHJhbnNsYXRlID0gdGhpcy5fc2Nyb2xsLmdyb3VwVHJhbnNsYXRlO1xuICAgIGdyb3VwVHJhbnNsYXRlWzBdID0gMDtcbiAgICBncm91cFRyYW5zbGF0ZVsxXSA9IDA7XG4gICAgZ3JvdXBUcmFuc2xhdGVbMl0gPSAwO1xuICAgIGdyb3VwVHJhbnNsYXRlW3RoaXMuX2RpcmVjdGlvbl0gPSAtdGhpcy5fc2Nyb2xsLmdyb3VwU3RhcnQgLSBzY3JvbGxPZmZzZXQ7XG4gICAgdmFyIHNlcXVlbnRpYWxTY3JvbGxpbmdPcHRpbWl6ZWQgPSB0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzID8gdGhpcy5fbGF5b3V0LmNhcGFiaWxpdGllcy5zZXF1ZW50aWFsU2Nyb2xsaW5nT3B0aW1pemVkIDogZmFsc2U7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuX25vZGVzLmJ1aWxkU3BlY0FuZERlc3Ryb3lVbnJlbmRlcmVkTm9kZXMoc2VxdWVudGlhbFNjcm9sbGluZ09wdGltaXplZCA/IGdyb3VwVHJhbnNsYXRlIDogdW5kZWZpbmVkKTtcbiAgICB0aGlzLl9zcGVjcyA9IHJlc3VsdC5zcGVjcztcbiAgICBpZiAocmVzdWx0Lm1vZGlmaWVkKSB7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3JlZmxvdycsIHsgdGFyZ2V0OiB0aGlzIH0pO1xuICAgIH1cbiAgICBpZiAoZW1pdFNjcm9sbEV2ZW50KSB7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3Njcm9sbCcsIGV2ZW50RGF0YSk7XG4gICAgfVxuICAgIGlmIChldmVudERhdGEpIHtcbiAgICAgICAgdmFyIHZpc2libGVJdGVtID0gdGhpcy5vcHRpb25zLmFsaWdubWVudCA/IHRoaXMuZ2V0TGFzdFZpc2libGVJdGVtKCkgOiB0aGlzLmdldEZpcnN0VmlzaWJsZUl0ZW0oKTtcbiAgICAgICAgaWYgKHZpc2libGVJdGVtICYmICF0aGlzLl92aXNpYmxlSXRlbUNhY2hlIHx8ICF2aXNpYmxlSXRlbSAmJiB0aGlzLl92aXNpYmxlSXRlbUNhY2hlIHx8IHZpc2libGVJdGVtICYmIHRoaXMuX3Zpc2libGVJdGVtQ2FjaGUgJiYgdmlzaWJsZUl0ZW0ucmVuZGVyTm9kZSAhPT0gdGhpcy5fdmlzaWJsZUl0ZW1DYWNoZS5yZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdwYWdlY2hhbmdlJywge1xuICAgICAgICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICAgICAgICBvbGRWaWV3U2VxdWVuY2U6IHRoaXMuX3Zpc2libGVJdGVtQ2FjaGUgPyB0aGlzLl92aXNpYmxlSXRlbUNhY2hlLnZpZXdTZXF1ZW5jZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB2aWV3U2VxdWVuY2U6IHZpc2libGVJdGVtID8gdmlzaWJsZUl0ZW0udmlld1NlcXVlbmNlIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIG9sZEluZGV4OiB0aGlzLl92aXNpYmxlSXRlbUNhY2hlID8gdGhpcy5fdmlzaWJsZUl0ZW1DYWNoZS5pbmRleCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBpbmRleDogdmlzaWJsZUl0ZW0gPyB2aXNpYmxlSXRlbS5pbmRleCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICByZW5kZXJOb2RlOiB2aXNpYmxlSXRlbSA/IHZpc2libGVJdGVtLnJlbmRlck5vZGUgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgb2xkUmVuZGVyTm9kZTogdGhpcy5fdmlzaWJsZUl0ZW1DYWNoZSA/IHRoaXMuX3Zpc2libGVJdGVtQ2FjaGUucmVuZGVyTm9kZSA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl92aXNpYmxlSXRlbUNhY2hlID0gdmlzaWJsZUl0ZW07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVtaXRFbmRTY3JvbGxpbmdFdmVudCkge1xuICAgICAgICB0aGlzLl9zY3JvbGwuaXNTY3JvbGxpbmcgPSBmYWxzZTtcbiAgICAgICAgZXZlbnREYXRhID0ge1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICAgICAgb2xkU2l6ZTogc2l6ZSxcbiAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICBvbGRTY3JvbGxPZmZzZXQ6IHNjcm9sbE9mZnNldCxcbiAgICAgICAgICAgIHNjcm9sbE9mZnNldDogc2Nyb2xsT2Zmc2V0XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3Njcm9sbGVuZCcsIGV2ZW50RGF0YSk7XG4gICAgfVxuICAgIHZhciB0cmFuc2Zvcm0gPSBjb250ZXh0LnRyYW5zZm9ybTtcbiAgICBpZiAoc2VxdWVudGlhbFNjcm9sbGluZ09wdGltaXplZCkge1xuICAgICAgICB2YXIgd2luZG93T2Zmc2V0ID0gc2Nyb2xsT2Zmc2V0ICsgdGhpcy5fc2Nyb2xsLmdyb3VwU3RhcnQ7XG4gICAgICAgIHZhciB0cmFuc2xhdGUgPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF07XG4gICAgICAgIHRyYW5zbGF0ZVt0aGlzLl9kaXJlY3Rpb25dID0gd2luZG93T2Zmc2V0O1xuICAgICAgICB0cmFuc2Zvcm0gPSBUcmFuc2Zvcm0udGhlbk1vdmUodHJhbnNmb3JtLCB0cmFuc2xhdGUpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybSxcbiAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgb3BhY2l0eTogY29udGV4dC5vcGFjaXR5LFxuICAgICAgICBvcmlnaW46IGNvbnRleHQub3JpZ2luLFxuICAgICAgICB0YXJnZXQ6IHRoaXMuZ3JvdXAucmVuZGVyKClcbiAgICB9O1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICBpZiAodGhpcy5jb250YWluZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLnJlbmRlci5hcHBseSh0aGlzLmNvbnRhaW5lciwgYXJndW1lbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5pZDtcbiAgICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBTY3JvbGxDb250cm9sbGVyOyIsInZhciBFdmVudEhhbmRsZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5FdmVudEhhbmRsZXIgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5FdmVudEhhbmRsZXIgOiBudWxsO1xuZnVuY3Rpb24gVmlydHVhbFZpZXdTZXF1ZW5jZShvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5fID0gb3B0aW9ucy5fIHx8IG5ldyB0aGlzLmNvbnN0cnVjdG9yLkJhY2tpbmcob3B0aW9ucyk7XG4gICAgdGhpcy50b3VjaGVkID0gdHJ1ZTtcbiAgICB0aGlzLnZhbHVlID0gb3B0aW9ucy52YWx1ZSB8fCB0aGlzLl8uZmFjdG9yeS5jcmVhdGUoKTtcbiAgICB0aGlzLmluZGV4ID0gb3B0aW9ucy5pbmRleCB8fCAwO1xuICAgIHRoaXMubmV4dCA9IG9wdGlvbnMubmV4dDtcbiAgICB0aGlzLnByZXYgPSBvcHRpb25zLnByZXY7XG4gICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcywgdGhpcy5fLmV2ZW50T3V0cHV0KTtcbiAgICB0aGlzLnZhbHVlLnBpcGUodGhpcy5fLmV2ZW50T3V0cHV0KTtcbn1cblZpcnR1YWxWaWV3U2VxdWVuY2UuQmFja2luZyA9IGZ1bmN0aW9uIEJhY2tpbmcob3B0aW9ucykge1xuICAgIHRoaXMuZmFjdG9yeSA9IG9wdGlvbnMuZmFjdG9yeTtcbiAgICB0aGlzLmV2ZW50T3V0cHV0ID0gbmV3IEV2ZW50SGFuZGxlcigpO1xufTtcblZpcnR1YWxWaWV3U2VxdWVuY2UucHJvdG90eXBlLmdldFByZXZpb3VzID0gZnVuY3Rpb24gKG5vQ3JlYXRlKSB7XG4gICAgaWYgKHRoaXMucHJldikge1xuICAgICAgICB0aGlzLnByZXYudG91Y2hlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzLnByZXY7XG4gICAgfVxuICAgIGlmIChub0NyZWF0ZSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB2YXIgdmFsdWUgPSB0aGlzLl8uZmFjdG9yeS5jcmVhdGVQcmV2aW91cyh0aGlzLmdldCgpKTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRoaXMucHJldiA9IG5ldyBWaXJ0dWFsVmlld1NlcXVlbmNlKHtcbiAgICAgICAgXzogdGhpcy5fLFxuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGluZGV4OiB0aGlzLmluZGV4IC0gMSxcbiAgICAgICAgbmV4dDogdGhpc1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLnByZXY7XG59O1xuVmlydHVhbFZpZXdTZXF1ZW5jZS5wcm90b3R5cGUuZ2V0TmV4dCA9IGZ1bmN0aW9uIChub0NyZWF0ZSkge1xuICAgIGlmICh0aGlzLm5leHQpIHtcbiAgICAgICAgdGhpcy5uZXh0LnRvdWNoZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcy5uZXh0O1xuICAgIH1cbiAgICBpZiAobm9DcmVhdGUpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdmFyIHZhbHVlID0gdGhpcy5fLmZhY3RvcnkuY3JlYXRlTmV4dCh0aGlzLmdldCgpKTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRoaXMubmV4dCA9IG5ldyBWaXJ0dWFsVmlld1NlcXVlbmNlKHtcbiAgICAgICAgXzogdGhpcy5fLFxuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGluZGV4OiB0aGlzLmluZGV4ICsgMSxcbiAgICAgICAgcHJldjogdGhpc1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLm5leHQ7XG59O1xuVmlydHVhbFZpZXdTZXF1ZW5jZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudG91Y2hlZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG59O1xuVmlydHVhbFZpZXdTZXF1ZW5jZS5wcm90b3R5cGUuZ2V0SW5kZXggPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy50b3VjaGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5pbmRleDtcbn07XG5WaXJ0dWFsVmlld1NlcXVlbmNlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJycgKyB0aGlzLmluZGV4O1xufTtcblZpcnR1YWxWaWV3U2VxdWVuY2UucHJvdG90eXBlLmNsZWFudXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLnByZXY7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKCFub2RlLnRvdWNoZWQpIHtcbiAgICAgICAgICAgIG5vZGUubmV4dC5wcmV2ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgbm9kZS5uZXh0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKHRoaXMuXy5mYWN0b3J5LmRlc3Ryb3kpIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl8uZmFjdG9yeS5kZXN0cm95KG5vZGUudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5wcmV2O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUudG91Y2hlZCA9IGZhbHNlO1xuICAgICAgICBub2RlID0gbm9kZS5wcmV2O1xuICAgIH1cbiAgICBub2RlID0gdGhpcy5uZXh0O1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmICghbm9kZS50b3VjaGVkKSB7XG4gICAgICAgICAgICBub2RlLnByZXYubmV4dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIG5vZGUucHJldiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICh0aGlzLl8uZmFjdG9yeS5kZXN0cm95KSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fLmZhY3RvcnkuZGVzdHJveShub2RlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBub2RlLnRvdWNoZWQgPSBmYWxzZTtcbiAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuVmlydHVhbFZpZXdTZXF1ZW5jZS5wcm90b3R5cGUudW5zaGlmdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdWaXJ0dWFsVmlld1NlcXVlbmNlLnVuc2hpZnQgaXMgbm90IHN1cHBvcnRlZCBhbmQgc2hvdWxkIG5vdCBiZSBjYWxsZWQnKTtcbiAgICB9XG59O1xuVmlydHVhbFZpZXdTZXF1ZW5jZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdWaXJ0dWFsVmlld1NlcXVlbmNlLnB1c2ggaXMgbm90IHN1cHBvcnRlZCBhbmQgc2hvdWxkIG5vdCBiZSBjYWxsZWQnKTtcbiAgICB9XG59O1xuVmlydHVhbFZpZXdTZXF1ZW5jZS5wcm90b3R5cGUuc3BsaWNlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChjb25zb2xlLmVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1ZpcnR1YWxWaWV3U2VxdWVuY2Uuc3BsaWNlIGlzIG5vdCBzdXBwb3J0ZWQgYW5kIHNob3VsZCBub3QgYmUgY2FsbGVkJyk7XG4gICAgfVxufTtcblZpcnR1YWxWaWV3U2VxdWVuY2UucHJvdG90eXBlLnN3YXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGNvbnNvbGUuZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignVmlydHVhbFZpZXdTZXF1ZW5jZS5zd2FwIGlzIG5vdCBzdXBwb3J0ZWQgYW5kIHNob3VsZCBub3QgYmUgY2FsbGVkJyk7XG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gVmlydHVhbFZpZXdTZXF1ZW5jZTsiLCJ2YXIgTGF5b3V0VXRpbGl0eSA9IHJlcXVpcmUoJy4uL0xheW91dFV0aWxpdHknKTtcbmZ1bmN0aW9uIExheW91dERvY2tIZWxwZXIoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBzaXplID0gY29udGV4dC5zaXplO1xuICAgIHRoaXMuX3NpemUgPSBzaXplO1xuICAgIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuX3ogPSBvcHRpb25zICYmIG9wdGlvbnMudHJhbnNsYXRlWiA/IG9wdGlvbnMudHJhbnNsYXRlWiA6IDA7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5tYXJnaW5zKSB7XG4gICAgICAgIHZhciBtYXJnaW5zID0gTGF5b3V0VXRpbGl0eS5ub3JtYWxpemVNYXJnaW5zKG9wdGlvbnMubWFyZ2lucyk7XG4gICAgICAgIHRoaXMuX2xlZnQgPSBtYXJnaW5zWzNdO1xuICAgICAgICB0aGlzLl90b3AgPSBtYXJnaW5zWzBdO1xuICAgICAgICB0aGlzLl9yaWdodCA9IHNpemVbMF0gLSBtYXJnaW5zWzFdO1xuICAgICAgICB0aGlzLl9ib3R0b20gPSBzaXplWzFdIC0gbWFyZ2luc1syXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9sZWZ0ID0gMDtcbiAgICAgICAgdGhpcy5fdG9wID0gMDtcbiAgICAgICAgdGhpcy5fcmlnaHQgPSBzaXplWzBdO1xuICAgICAgICB0aGlzLl9ib3R0b20gPSBzaXplWzFdO1xuICAgIH1cbn1cbkxheW91dERvY2tIZWxwZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJ1bGUgPSBkYXRhW2ldO1xuICAgICAgICB2YXIgdmFsdWUgPSBydWxlLmxlbmd0aCA+PSAzID8gcnVsZVsyXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHJ1bGVbMF0gPT09ICd0b3AnKSB7XG4gICAgICAgICAgICB0aGlzLnRvcChydWxlWzFdLCB2YWx1ZSwgcnVsZS5sZW5ndGggPj0gNCA/IHJ1bGVbM10gOiB1bmRlZmluZWQpO1xuICAgICAgICB9IGVsc2UgaWYgKHJ1bGVbMF0gPT09ICdsZWZ0Jykge1xuICAgICAgICAgICAgdGhpcy5sZWZ0KHJ1bGVbMV0sIHZhbHVlLCBydWxlLmxlbmd0aCA+PSA0ID8gcnVsZVszXSA6IHVuZGVmaW5lZCk7XG4gICAgICAgIH0gZWxzZSBpZiAocnVsZVswXSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgICAgdGhpcy5yaWdodChydWxlWzFdLCB2YWx1ZSwgcnVsZS5sZW5ndGggPj0gNCA/IHJ1bGVbM10gOiB1bmRlZmluZWQpO1xuICAgICAgICB9IGVsc2UgaWYgKHJ1bGVbMF0gPT09ICdib3R0b20nKSB7XG4gICAgICAgICAgICB0aGlzLmJvdHRvbShydWxlWzFdLCB2YWx1ZSwgcnVsZS5sZW5ndGggPj0gNCA/IHJ1bGVbM10gOiB1bmRlZmluZWQpO1xuICAgICAgICB9IGVsc2UgaWYgKHJ1bGVbMF0gPT09ICdmaWxsJykge1xuICAgICAgICAgICAgdGhpcy5maWxsKHJ1bGVbMV0sIHJ1bGUubGVuZ3RoID49IDMgPyBydWxlWzJdIDogdW5kZWZpbmVkKTtcbiAgICAgICAgfSBlbHNlIGlmIChydWxlWzBdID09PSAnbWFyZ2lucycpIHtcbiAgICAgICAgICAgIHRoaXMubWFyZ2lucyhydWxlWzFdKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5MYXlvdXREb2NrSGVscGVyLnByb3RvdHlwZS50b3AgPSBmdW5jdGlvbiAobm9kZSwgaGVpZ2h0LCB6KSB7XG4gICAgaWYgKGhlaWdodCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGhlaWdodCA9IGhlaWdodFsxXTtcbiAgICB9XG4gICAgaWYgKGhlaWdodCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHZhciBzaXplID0gdGhpcy5fY29udGV4dC5yZXNvbHZlU2l6ZShub2RlLCBbXG4gICAgICAgICAgICAgICAgdGhpcy5fcmlnaHQgLSB0aGlzLl9sZWZ0LFxuICAgICAgICAgICAgICAgIHRoaXMuX2JvdHRvbSAtIHRoaXMuX3RvcFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGhlaWdodCA9IHNpemVbMV07XG4gICAgfVxuICAgIHRoaXMuX2NvbnRleHQuc2V0KG5vZGUsIHtcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgdGhpcy5fcmlnaHQgLSB0aGlzLl9sZWZ0LFxuICAgICAgICAgICAgaGVpZ2h0XG4gICAgICAgIF0sXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgYWxpZ246IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgdGhpcy5fbGVmdCxcbiAgICAgICAgICAgIHRoaXMuX3RvcCxcbiAgICAgICAgICAgIHogPT09IHVuZGVmaW5lZCA/IHRoaXMuX3ogOiB6XG4gICAgICAgIF1cbiAgICB9KTtcbiAgICB0aGlzLl90b3AgKz0gaGVpZ2h0O1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dERvY2tIZWxwZXIucHJvdG90eXBlLmxlZnQgPSBmdW5jdGlvbiAobm9kZSwgd2lkdGgsIHopIHtcbiAgICBpZiAod2lkdGggaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB3aWR0aCA9IHdpZHRoWzBdO1xuICAgIH1cbiAgICBpZiAod2lkdGggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuX2NvbnRleHQucmVzb2x2ZVNpemUobm9kZSwgW1xuICAgICAgICAgICAgICAgIHRoaXMuX3JpZ2h0IC0gdGhpcy5fbGVmdCxcbiAgICAgICAgICAgICAgICB0aGlzLl9ib3R0b20gLSB0aGlzLl90b3BcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB3aWR0aCA9IHNpemVbMF07XG4gICAgfVxuICAgIHRoaXMuX2NvbnRleHQuc2V0KG5vZGUsIHtcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICB0aGlzLl9ib3R0b20gLSB0aGlzLl90b3BcbiAgICAgICAgXSxcbiAgICAgICAgb3JpZ2luOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICBhbGlnbjogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICB0aGlzLl9sZWZ0LFxuICAgICAgICAgICAgdGhpcy5fdG9wLFxuICAgICAgICAgICAgeiA9PT0gdW5kZWZpbmVkID8gdGhpcy5feiA6IHpcbiAgICAgICAgXVxuICAgIH0pO1xuICAgIHRoaXMuX2xlZnQgKz0gd2lkdGg7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuTGF5b3V0RG9ja0hlbHBlci5wcm90b3R5cGUuYm90dG9tID0gZnVuY3Rpb24gKG5vZGUsIGhlaWdodCwgeikge1xuICAgIGlmIChoZWlnaHQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBoZWlnaHQgPSBoZWlnaHRbMV07XG4gICAgfVxuICAgIGlmIChoZWlnaHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuX2NvbnRleHQucmVzb2x2ZVNpemUobm9kZSwgW1xuICAgICAgICAgICAgICAgIHRoaXMuX3JpZ2h0IC0gdGhpcy5fbGVmdCxcbiAgICAgICAgICAgICAgICB0aGlzLl9ib3R0b20gLSB0aGlzLl90b3BcbiAgICAgICAgICAgIF0pO1xuICAgICAgICBoZWlnaHQgPSBzaXplWzFdO1xuICAgIH1cbiAgICB0aGlzLl9jb250ZXh0LnNldChub2RlLCB7XG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIHRoaXMuX3JpZ2h0IC0gdGhpcy5fbGVmdCxcbiAgICAgICAgICAgIGhlaWdodFxuICAgICAgICBdLFxuICAgICAgICBvcmlnaW46IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxXG4gICAgICAgIF0sXG4gICAgICAgIGFsaWduOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMVxuICAgICAgICBdLFxuICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgIHRoaXMuX2xlZnQsXG4gICAgICAgICAgICAtKHRoaXMuX3NpemVbMV0gLSB0aGlzLl9ib3R0b20pLFxuICAgICAgICAgICAgeiA9PT0gdW5kZWZpbmVkID8gdGhpcy5feiA6IHpcbiAgICAgICAgXVxuICAgIH0pO1xuICAgIHRoaXMuX2JvdHRvbSAtPSBoZWlnaHQ7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuTGF5b3V0RG9ja0hlbHBlci5wcm90b3R5cGUucmlnaHQgPSBmdW5jdGlvbiAobm9kZSwgd2lkdGgsIHopIHtcbiAgICBpZiAod2lkdGggaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB3aWR0aCA9IHdpZHRoWzBdO1xuICAgIH1cbiAgICBpZiAobm9kZSkge1xuICAgICAgICBpZiAod2lkdGggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFyIHNpemUgPSB0aGlzLl9jb250ZXh0LnJlc29sdmVTaXplKG5vZGUsIFtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmlnaHQgLSB0aGlzLl9sZWZ0LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ib3R0b20gLSB0aGlzLl90b3BcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIHdpZHRoID0gc2l6ZVswXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jb250ZXh0LnNldChub2RlLCB7XG4gICAgICAgICAgICBzaXplOiBbXG4gICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgdGhpcy5fYm90dG9tIC0gdGhpcy5fdG9wXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgb3JpZ2luOiBbXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgYWxpZ246IFtcbiAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgICAgICAtKHRoaXMuX3NpemVbMF0gLSB0aGlzLl9yaWdodCksXG4gICAgICAgICAgICAgICAgdGhpcy5fdG9wLFxuICAgICAgICAgICAgICAgIHogPT09IHVuZGVmaW5lZCA/IHRoaXMuX3ogOiB6XG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAod2lkdGgpIHtcbiAgICAgICAgdGhpcy5fcmlnaHQgLT0gd2lkdGg7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dERvY2tIZWxwZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAobm9kZSwgeikge1xuICAgIHRoaXMuX2NvbnRleHQuc2V0KG5vZGUsIHtcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgdGhpcy5fcmlnaHQgLSB0aGlzLl9sZWZ0LFxuICAgICAgICAgICAgdGhpcy5fYm90dG9tIC0gdGhpcy5fdG9wXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgdGhpcy5fbGVmdCxcbiAgICAgICAgICAgIHRoaXMuX3RvcCxcbiAgICAgICAgICAgIHogPT09IHVuZGVmaW5lZCA/IHRoaXMuX3ogOiB6XG4gICAgICAgIF1cbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5MYXlvdXREb2NrSGVscGVyLnByb3RvdHlwZS5tYXJnaW5zID0gZnVuY3Rpb24gKG1hcmdpbnMpIHtcbiAgICBtYXJnaW5zID0gTGF5b3V0VXRpbGl0eS5ub3JtYWxpemVNYXJnaW5zKG1hcmdpbnMpO1xuICAgIHRoaXMuX2xlZnQgKz0gbWFyZ2luc1szXTtcbiAgICB0aGlzLl90b3AgKz0gbWFyZ2luc1swXTtcbiAgICB0aGlzLl9yaWdodCAtPSBtYXJnaW5zWzFdO1xuICAgIHRoaXMuX2JvdHRvbSAtPSBtYXJnaW5zWzJdO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dFV0aWxpdHkucmVnaXN0ZXJIZWxwZXIoJ2RvY2snLCBMYXlvdXREb2NrSGVscGVyKTtcbm1vZHVsZS5leHBvcnRzID0gTGF5b3V0RG9ja0hlbHBlcjsiLCJ2YXIgVXRpbGl0eSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IG51bGw7XG52YXIgTGF5b3V0VXRpbGl0eSA9IHJlcXVpcmUoJy4uL0xheW91dFV0aWxpdHknKTtcbnZhciBjYXBhYmlsaXRpZXMgPSB7XG4gICAgICAgIHNlcXVlbmNlOiB0cnVlLFxuICAgICAgICBkaXJlY3Rpb246IFtcbiAgICAgICAgICAgIFV0aWxpdHkuRGlyZWN0aW9uLlksXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5YXG4gICAgICAgIF0sXG4gICAgICAgIHNjcm9sbGluZzogdHJ1ZSxcbiAgICAgICAgdHJ1ZVNpemU6IHRydWUsXG4gICAgICAgIHNlcXVlbnRpYWxTY3JvbGxpbmdPcHRpbWl6ZWQ6IHRydWVcbiAgICB9O1xudmFyIGNvbnRleHQ7XG52YXIgc2l6ZTtcbnZhciBkaXJlY3Rpb247XG52YXIgYWxpZ25tZW50O1xudmFyIGxpbmVEaXJlY3Rpb247XG52YXIgbGluZUxlbmd0aDtcbnZhciBvZmZzZXQ7XG52YXIgbWFyZ2lucztcbnZhciBtYXJnaW4gPSBbXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdO1xudmFyIHNwYWNpbmc7XG52YXIganVzdGlmeTtcbnZhciBpdGVtU2l6ZTtcbnZhciBnZXRJdGVtU2l6ZTtcbnZhciBsaW5lTm9kZXM7XG5mdW5jdGlvbiBfbGF5b3V0TGluZShuZXh0LCBlbmRSZWFjaGVkKSB7XG4gICAgaWYgKCFsaW5lTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICB2YXIgaTtcbiAgICB2YXIgbGluZVNpemUgPSBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdO1xuICAgIHZhciBsaW5lTm9kZTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGluZU5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxpbmVTaXplW2RpcmVjdGlvbl0gPSBNYXRoLm1heChsaW5lU2l6ZVtkaXJlY3Rpb25dLCBsaW5lTm9kZXNbaV0uc2l6ZVtkaXJlY3Rpb25dKTtcbiAgICAgICAgbGluZVNpemVbbGluZURpcmVjdGlvbl0gKz0gKGkgPiAwID8gc3BhY2luZ1tsaW5lRGlyZWN0aW9uXSA6IDApICsgbGluZU5vZGVzW2ldLnNpemVbbGluZURpcmVjdGlvbl07XG4gICAgfVxuICAgIHZhciBqdXN0aWZ5T2Zmc2V0ID0ganVzdGlmeVtsaW5lRGlyZWN0aW9uXSA/IChsaW5lTGVuZ3RoIC0gbGluZVNpemVbbGluZURpcmVjdGlvbl0pIC8gKGxpbmVOb2Rlcy5sZW5ndGggKiAyKSA6IDA7XG4gICAgdmFyIGxpbmVPZmZzZXQgPSAoZGlyZWN0aW9uID8gbWFyZ2luc1szXSA6IG1hcmdpbnNbMF0pICsganVzdGlmeU9mZnNldDtcbiAgICB2YXIgc2Nyb2xsTGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsaW5lTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGluZU5vZGUgPSBsaW5lTm9kZXNbaV07XG4gICAgICAgIHZhciB0cmFuc2xhdGUgPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF07XG4gICAgICAgIHRyYW5zbGF0ZVtsaW5lRGlyZWN0aW9uXSA9IGxpbmVPZmZzZXQ7XG4gICAgICAgIHRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gbmV4dCA/IG9mZnNldCA6IG9mZnNldCAtIGxpbmVTaXplW2RpcmVjdGlvbl07XG4gICAgICAgIHNjcm9sbExlbmd0aCA9IDA7XG4gICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICBzY3JvbGxMZW5ndGggPSBsaW5lU2l6ZVtkaXJlY3Rpb25dO1xuICAgICAgICAgICAgaWYgKGVuZFJlYWNoZWQgJiYgKG5leHQgJiYgIWFsaWdubWVudCB8fCAhbmV4dCAmJiBhbGlnbm1lbnQpKSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsTGVuZ3RoICs9IGRpcmVjdGlvbiA/IG1hcmdpbnNbMF0gKyBtYXJnaW5zWzJdIDogbWFyZ2luc1szXSArIG1hcmdpbnNbMV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjcm9sbExlbmd0aCArPSBzcGFjaW5nW2RpcmVjdGlvbl07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZU5vZGUuc2V0ID0ge1xuICAgICAgICAgICAgc2l6ZTogbGluZU5vZGUuc2l6ZSxcbiAgICAgICAgICAgIHRyYW5zbGF0ZTogdHJhbnNsYXRlLFxuICAgICAgICAgICAgc2Nyb2xsTGVuZ3RoOiBzY3JvbGxMZW5ndGhcbiAgICAgICAgfTtcbiAgICAgICAgbGluZU9mZnNldCArPSBsaW5lTm9kZS5zaXplW2xpbmVEaXJlY3Rpb25dICsgc3BhY2luZ1tsaW5lRGlyZWN0aW9uXSArIGp1c3RpZnlPZmZzZXQgKiAyO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGluZU5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxpbmVOb2RlID0gbmV4dCA/IGxpbmVOb2Rlc1tpXSA6IGxpbmVOb2Rlc1tsaW5lTm9kZXMubGVuZ3RoIC0gMSAtIGldO1xuICAgICAgICBjb250ZXh0LnNldChsaW5lTm9kZS5ub2RlLCBsaW5lTm9kZS5zZXQpO1xuICAgIH1cbiAgICBsaW5lTm9kZXMgPSBbXTtcbiAgICByZXR1cm4gbGluZVNpemVbZGlyZWN0aW9uXSArIHNwYWNpbmdbZGlyZWN0aW9uXTtcbn1cbmZ1bmN0aW9uIF9yZXNvbHZlTm9kZVNpemUobm9kZSkge1xuICAgIHZhciBsb2NhbEl0ZW1TaXplID0gaXRlbVNpemU7XG4gICAgaWYgKGdldEl0ZW1TaXplKSB7XG4gICAgICAgIGxvY2FsSXRlbVNpemUgPSBnZXRJdGVtU2l6ZShub2RlLnJlbmRlck5vZGUsIHNpemUpO1xuICAgIH1cbiAgICBpZiAobG9jYWxJdGVtU2l6ZVswXSA9PT0gdHJ1ZSB8fCBsb2NhbEl0ZW1TaXplWzFdID09PSB0cnVlKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBjb250ZXh0LnJlc29sdmVTaXplKG5vZGUsIHNpemUpO1xuICAgICAgICBpZiAobG9jYWxJdGVtU2l6ZVswXSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgcmVzdWx0WzBdID0gaXRlbVNpemVbMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvY2FsSXRlbVNpemVbMV0gIT09IHRydWUpIHtcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IGl0ZW1TaXplWzFdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsSXRlbVNpemU7XG4gICAgfVxufVxuZnVuY3Rpb24gQ29sbGVjdGlvbkxheW91dChjb250ZXh0Xywgb3B0aW9ucykge1xuICAgIGNvbnRleHQgPSBjb250ZXh0XztcbiAgICBzaXplID0gY29udGV4dC5zaXplO1xuICAgIGRpcmVjdGlvbiA9IGNvbnRleHQuZGlyZWN0aW9uO1xuICAgIGFsaWdubWVudCA9IGNvbnRleHQuYWxpZ25tZW50O1xuICAgIGxpbmVEaXJlY3Rpb24gPSAoZGlyZWN0aW9uICsgMSkgJSAyO1xuICAgIGlmIChvcHRpb25zLmd1dHRlciAhPT0gdW5kZWZpbmVkICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2d1dHRlciBoYXMgYmVlbiBkZXByZWNhdGVkIGZvciBDb2xsZWN0aW9uTGF5b3V0LCB1c2UgbWFyZ2lucyAmIHNwYWNpbmcgaW5zdGVhZCcpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5ndXR0ZXIgJiYgIW9wdGlvbnMubWFyZ2lucyAmJiAhb3B0aW9ucy5zcGFjaW5nKSB7XG4gICAgICAgIHZhciBndXR0ZXIgPSBBcnJheS5pc0FycmF5KG9wdGlvbnMuZ3V0dGVyKSA/IG9wdGlvbnMuZ3V0dGVyIDogW1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZ3V0dGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMuZ3V0dGVyXG4gICAgICAgICAgICBdO1xuICAgICAgICBtYXJnaW5zID0gW1xuICAgICAgICAgICAgZ3V0dGVyWzFdLFxuICAgICAgICAgICAgZ3V0dGVyWzBdLFxuICAgICAgICAgICAgZ3V0dGVyWzFdLFxuICAgICAgICAgICAgZ3V0dGVyWzBdXG4gICAgICAgIF07XG4gICAgICAgIHNwYWNpbmcgPSBndXR0ZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbWFyZ2lucyA9IExheW91dFV0aWxpdHkubm9ybWFsaXplTWFyZ2lucyhvcHRpb25zLm1hcmdpbnMpO1xuICAgICAgICBzcGFjaW5nID0gb3B0aW9ucy5zcGFjaW5nIHx8IDA7XG4gICAgICAgIHNwYWNpbmcgPSBBcnJheS5pc0FycmF5KHNwYWNpbmcpID8gc3BhY2luZyA6IFtcbiAgICAgICAgICAgIHNwYWNpbmcsXG4gICAgICAgICAgICBzcGFjaW5nXG4gICAgICAgIF07XG4gICAgfVxuICAgIG1hcmdpblswXSA9IG1hcmdpbnNbZGlyZWN0aW9uID8gMCA6IDNdO1xuICAgIG1hcmdpblsxXSA9IC1tYXJnaW5zW2RpcmVjdGlvbiA/IDIgOiAxXTtcbiAgICBqdXN0aWZ5ID0gQXJyYXkuaXNBcnJheShvcHRpb25zLmp1c3RpZnkpID8gb3B0aW9ucy5qdXN0aWZ5IDogb3B0aW9ucy5qdXN0aWZ5ID8gW1xuICAgICAgICB0cnVlLFxuICAgICAgICB0cnVlXG4gICAgXSA6IFtcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIGZhbHNlXG4gICAgXTtcbiAgICBsaW5lTGVuZ3RoID0gc2l6ZVtsaW5lRGlyZWN0aW9uXSAtIChkaXJlY3Rpb24gPyBtYXJnaW5zWzNdICsgbWFyZ2luc1sxXSA6IG1hcmdpbnNbMF0gKyBtYXJnaW5zWzJdKTtcbiAgICB2YXIgbm9kZTtcbiAgICB2YXIgbm9kZVNpemU7XG4gICAgdmFyIGxpbmVPZmZzZXQ7XG4gICAgdmFyIGJvdW5kO1xuICAgIGlmICghb3B0aW9ucy5pdGVtU2l6ZSkge1xuICAgICAgICBpdGVtU2l6ZSA9IFtcbiAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgIF07XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLml0ZW1TaXplIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgZ2V0SXRlbVNpemUgPSBvcHRpb25zLml0ZW1TaXplO1xuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5pdGVtU2l6ZVswXSA9PT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMuaXRlbVNpemVbMF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpdGVtU2l6ZSA9IFtcbiAgICAgICAgICAgIG9wdGlvbnMuaXRlbVNpemVbMF0gPT09IHVuZGVmaW5lZCA/IHNpemVbMF0gOiBvcHRpb25zLml0ZW1TaXplWzBdLFxuICAgICAgICAgICAgb3B0aW9ucy5pdGVtU2l6ZVsxXSA9PT0gdW5kZWZpbmVkID8gc2l6ZVsxXSA6IG9wdGlvbnMuaXRlbVNpemVbMV1cbiAgICAgICAgXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpdGVtU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemU7XG4gICAgfVxuICAgIG9mZnNldCA9IGNvbnRleHQuc2Nyb2xsT2Zmc2V0ICsgKGFsaWdubWVudCA/IDAgOiBtYXJnaW5bYWxpZ25tZW50XSk7XG4gICAgYm91bmQgPSBjb250ZXh0LnNjcm9sbEVuZCArIChhbGlnbm1lbnQgPyAwIDogbWFyZ2luW2FsaWdubWVudF0pO1xuICAgIGxpbmVPZmZzZXQgPSAwO1xuICAgIGxpbmVOb2RlcyA9IFtdO1xuICAgIHdoaWxlIChvZmZzZXQgPCBib3VuZCkge1xuICAgICAgICBub2RlID0gY29udGV4dC5uZXh0KCk7XG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgX2xheW91dExpbmUodHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBub2RlU2l6ZSA9IF9yZXNvbHZlTm9kZVNpemUobm9kZSk7XG4gICAgICAgIGxpbmVPZmZzZXQgKz0gKGxpbmVOb2Rlcy5sZW5ndGggPyBzcGFjaW5nW2xpbmVEaXJlY3Rpb25dIDogMCkgKyBub2RlU2l6ZVtsaW5lRGlyZWN0aW9uXTtcbiAgICAgICAgaWYgKGxpbmVPZmZzZXQgPiBsaW5lTGVuZ3RoKSB7XG4gICAgICAgICAgICBvZmZzZXQgKz0gX2xheW91dExpbmUodHJ1ZSwgIW5vZGUpO1xuICAgICAgICAgICAgbGluZU9mZnNldCA9IG5vZGVTaXplW2xpbmVEaXJlY3Rpb25dO1xuICAgICAgICB9XG4gICAgICAgIGxpbmVOb2Rlcy5wdXNoKHtcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICBzaXplOiBub2RlU2l6ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgb2Zmc2V0ID0gY29udGV4dC5zY3JvbGxPZmZzZXQgKyAoYWxpZ25tZW50ID8gbWFyZ2luW2FsaWdubWVudF0gOiAwKTtcbiAgICBib3VuZCA9IGNvbnRleHQuc2Nyb2xsU3RhcnQgKyAoYWxpZ25tZW50ID8gbWFyZ2luW2FsaWdubWVudF0gOiAwKTtcbiAgICBsaW5lT2Zmc2V0ID0gMDtcbiAgICBsaW5lTm9kZXMgPSBbXTtcbiAgICB3aGlsZSAob2Zmc2V0ID4gYm91bmQpIHtcbiAgICAgICAgbm9kZSA9IGNvbnRleHQucHJldigpO1xuICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgIF9sYXlvdXRMaW5lKGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG5vZGVTaXplID0gX3Jlc29sdmVOb2RlU2l6ZShub2RlKTtcbiAgICAgICAgbGluZU9mZnNldCArPSAobGluZU5vZGVzLmxlbmd0aCA/IHNwYWNpbmdbbGluZURpcmVjdGlvbl0gOiAwKSArIG5vZGVTaXplW2xpbmVEaXJlY3Rpb25dO1xuICAgICAgICBpZiAobGluZU9mZnNldCA+IGxpbmVMZW5ndGgpIHtcbiAgICAgICAgICAgIG9mZnNldCAtPSBfbGF5b3V0TGluZShmYWxzZSwgIW5vZGUpO1xuICAgICAgICAgICAgbGluZU9mZnNldCA9IG5vZGVTaXplW2xpbmVEaXJlY3Rpb25dO1xuICAgICAgICB9XG4gICAgICAgIGxpbmVOb2Rlcy51bnNoaWZ0KHtcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICBzaXplOiBub2RlU2l6ZVxuICAgICAgICB9KTtcbiAgICB9XG59XG5Db2xsZWN0aW9uTGF5b3V0LkNhcGFiaWxpdGllcyA9IGNhcGFiaWxpdGllcztcbkNvbGxlY3Rpb25MYXlvdXQuTmFtZSA9ICdDb2xsZWN0aW9uTGF5b3V0JztcbkNvbGxlY3Rpb25MYXlvdXQuRGVzY3JpcHRpb24gPSAnTXVsdGktY2VsbCBjb2xsZWN0aW9uLWxheW91dCB3aXRoIG1hcmdpbnMgJiBzcGFjaW5nJztcbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvbkxheW91dDsiLCJ2YXIgVXRpbGl0eSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IG51bGw7XG52YXIgY2FwYWJpbGl0aWVzID0ge1xuICAgICAgICBzZXF1ZW5jZTogdHJ1ZSxcbiAgICAgICAgZGlyZWN0aW9uOiBbXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5YLFxuICAgICAgICAgICAgVXRpbGl0eS5EaXJlY3Rpb24uWVxuICAgICAgICBdLFxuICAgICAgICBzY3JvbGxpbmc6IHRydWVcbiAgICB9O1xuZnVuY3Rpb24gQ292ZXJMYXlvdXQoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBub2RlID0gY29udGV4dC5uZXh0KCk7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHNpemUgPSBjb250ZXh0LnNpemU7XG4gICAgdmFyIGRpcmVjdGlvbiA9IGNvbnRleHQuZGlyZWN0aW9uO1xuICAgIHZhciBpdGVtU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemU7XG4gICAgdmFyIG9wYWNpdHlTdGVwID0gMC4yO1xuICAgIHZhciBzY2FsZVN0ZXAgPSAwLjE7XG4gICAgdmFyIHRyYW5zbGF0ZVN0ZXAgPSAzMDtcbiAgICB2YXIgelN0YXJ0ID0gMTAwO1xuICAgIGNvbnRleHQuc2V0KG5vZGUsIHtcbiAgICAgICAgc2l6ZTogaXRlbVNpemUsXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgMC41XG4gICAgICAgIF0sXG4gICAgICAgIGFsaWduOiBbXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAwLjVcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHpTdGFydFxuICAgICAgICBdLFxuICAgICAgICBzY3JvbGxMZW5ndGg6IGl0ZW1TaXplW2RpcmVjdGlvbl1cbiAgICB9KTtcbiAgICB2YXIgdHJhbnNsYXRlID0gaXRlbVNpemVbMF0gLyAyO1xuICAgIHZhciBvcGFjaXR5ID0gMSAtIG9wYWNpdHlTdGVwO1xuICAgIHZhciB6SW5kZXggPSB6U3RhcnQgLSAxO1xuICAgIHZhciBzY2FsZSA9IDEgLSBzY2FsZVN0ZXA7XG4gICAgdmFyIHByZXYgPSBmYWxzZTtcbiAgICB2YXIgZW5kUmVhY2hlZCA9IGZhbHNlO1xuICAgIG5vZGUgPSBjb250ZXh0Lm5leHQoKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgbm9kZSA9IGNvbnRleHQucHJldigpO1xuICAgICAgICBwcmV2ID0gdHJ1ZTtcbiAgICB9XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgY29udGV4dC5zZXQobm9kZSwge1xuICAgICAgICAgICAgc2l6ZTogaXRlbVNpemUsXG4gICAgICAgICAgICBvcmlnaW46IFtcbiAgICAgICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAgICAgMC41XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgYWxpZ246IFtcbiAgICAgICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAgICAgMC41XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgdHJhbnNsYXRlOiBkaXJlY3Rpb24gPyBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBwcmV2ID8gLXRyYW5zbGF0ZSA6IHRyYW5zbGF0ZSxcbiAgICAgICAgICAgICAgICB6SW5kZXhcbiAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgcHJldiA/IC10cmFuc2xhdGUgOiB0cmFuc2xhdGUsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICB6SW5kZXhcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBzY2FsZTogW1xuICAgICAgICAgICAgICAgIHNjYWxlLFxuICAgICAgICAgICAgICAgIHNjYWxlLFxuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBvcGFjaXR5OiBvcGFjaXR5LFxuICAgICAgICAgICAgc2Nyb2xsTGVuZ3RoOiBpdGVtU2l6ZVtkaXJlY3Rpb25dXG4gICAgICAgIH0pO1xuICAgICAgICBvcGFjaXR5IC09IG9wYWNpdHlTdGVwO1xuICAgICAgICBzY2FsZSAtPSBzY2FsZVN0ZXA7XG4gICAgICAgIHRyYW5zbGF0ZSArPSB0cmFuc2xhdGVTdGVwO1xuICAgICAgICB6SW5kZXgtLTtcbiAgICAgICAgaWYgKHRyYW5zbGF0ZSA+PSBzaXplW2RpcmVjdGlvbl0gLyAyKSB7XG4gICAgICAgICAgICBlbmRSZWFjaGVkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUgPSBwcmV2ID8gY29udGV4dC5wcmV2KCkgOiBjb250ZXh0Lm5leHQoKTtcbiAgICAgICAgICAgIGVuZFJlYWNoZWQgPSAhbm9kZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5kUmVhY2hlZCkge1xuICAgICAgICAgICAgaWYgKHByZXYpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVuZFJlYWNoZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHByZXYgPSB0cnVlO1xuICAgICAgICAgICAgbm9kZSA9IGNvbnRleHQucHJldigpO1xuICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGUgPSBpdGVtU2l6ZVtkaXJlY3Rpb25dIC8gMjtcbiAgICAgICAgICAgICAgICBvcGFjaXR5ID0gMSAtIG9wYWNpdHlTdGVwO1xuICAgICAgICAgICAgICAgIHpJbmRleCA9IHpTdGFydCAtIDE7XG4gICAgICAgICAgICAgICAgc2NhbGUgPSAxIC0gc2NhbGVTdGVwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuQ292ZXJMYXlvdXQuQ2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0aWVzO1xubW9kdWxlLmV4cG9ydHMgPSBDb3ZlckxheW91dDsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEN1YmVMYXlvdXQoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBpdGVtU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemU7XG4gICAgY29udGV4dC5zZXQoY29udGV4dC5uZXh0KCksIHtcbiAgICAgICAgc2l6ZTogaXRlbVNpemUsXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgMC41XG4gICAgICAgIF0sXG4gICAgICAgIHJvdGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIE1hdGguUEkgLyAyLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgIGl0ZW1TaXplWzBdIC8gMixcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF1cbiAgICB9KTtcbiAgICBjb250ZXh0LnNldChjb250ZXh0Lm5leHQoKSwge1xuICAgICAgICBzaXplOiBpdGVtU2l6ZSxcbiAgICAgICAgb3JpZ2luOiBbXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAwLjVcbiAgICAgICAgXSxcbiAgICAgICAgcm90YXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgTWF0aC5QSSAvIDIsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgLShpdGVtU2l6ZVswXSAvIDIpLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXVxuICAgIH0pO1xuICAgIGNvbnRleHQuc2V0KGNvbnRleHQubmV4dCgpLCB7XG4gICAgICAgIHNpemU6IGl0ZW1TaXplLFxuICAgICAgICBvcmlnaW46IFtcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDAuNVxuICAgICAgICBdLFxuICAgICAgICByb3RhdGU6IFtcbiAgICAgICAgICAgIE1hdGguUEkgLyAyLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgLShpdGVtU2l6ZVsxXSAvIDIpLFxuICAgICAgICAgICAgMFxuICAgICAgICBdXG4gICAgfSk7XG4gICAgY29udGV4dC5zZXQoY29udGV4dC5uZXh0KCksIHtcbiAgICAgICAgc2l6ZTogaXRlbVNpemUsXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgMC41XG4gICAgICAgIF0sXG4gICAgICAgIHJvdGF0ZTogW1xuICAgICAgICAgICAgTWF0aC5QSSAvIDIsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBpdGVtU2l6ZVsxXSAvIDIsXG4gICAgICAgICAgICAwXG4gICAgICAgIF1cbiAgICB9KTtcbn07IiwidmFyIFV0aWxpdHkgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiBudWxsO1xudmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuLi9MYXlvdXRVdGlsaXR5Jyk7XG52YXIgY2FwYWJpbGl0aWVzID0ge1xuICAgICAgICBzZXF1ZW5jZTogdHJ1ZSxcbiAgICAgICAgZGlyZWN0aW9uOiBbXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5ZLFxuICAgICAgICAgICAgVXRpbGl0eS5EaXJlY3Rpb24uWFxuICAgICAgICBdLFxuICAgICAgICBzY3JvbGxpbmc6IGZhbHNlXG4gICAgfTtcbmZ1bmN0aW9uIEdyaWRMYXlvdXQoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciByZXZEaXJlY3Rpb24gPSBjb250ZXh0LmRpcmVjdGlvbiA/IDAgOiAxO1xuICAgIGlmIChvcHRpb25zLmd1dHRlciAhPT0gdW5kZWZpbmVkICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2d1dHRlciBoYXMgYmVlbiBkZXByZWNhdGVkIGZvciBHcmlkTGF5b3V0LCB1c2UgbWFyZ2lucyAmIHNwYWNpbmcgaW5zdGVhZCcpO1xuICAgIH1cbiAgICB2YXIgc3BhY2luZztcbiAgICBpZiAob3B0aW9ucy5ndXR0ZXIgJiYgIW9wdGlvbnMuc3BhY2luZykge1xuICAgICAgICBzcGFjaW5nID0gb3B0aW9ucy5ndXR0ZXIgfHwgMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzcGFjaW5nID0gb3B0aW9ucy5zcGFjaW5nIHx8IDA7XG4gICAgfVxuICAgIHNwYWNpbmcgPSBBcnJheS5pc0FycmF5KHNwYWNpbmcpID8gc3BhY2luZyA6IFtcbiAgICAgICAgc3BhY2luZyxcbiAgICAgICAgc3BhY2luZ1xuICAgIF07XG4gICAgdmFyIG1hcmdpbnMgPSBMYXlvdXRVdGlsaXR5Lm5vcm1hbGl6ZU1hcmdpbnMob3B0aW9ucy5tYXJnaW5zKTtcbiAgICB2YXIgbm9kZVNpemUgPSBbXG4gICAgICAgICAgICAoY29udGV4dC5zaXplWzBdIC0gKChvcHRpb25zLmNlbGxzWzBdIC0gMSkgKiBzcGFjaW5nWzBdICsgbWFyZ2luc1sxXSArIG1hcmdpbnNbM10pKSAvIG9wdGlvbnMuY2VsbHNbMF0sXG4gICAgICAgICAgICAoY29udGV4dC5zaXplWzFdIC0gKChvcHRpb25zLmNlbGxzWzFdIC0gMSkgKiBzcGFjaW5nWzFdICsgbWFyZ2luc1swXSArIG1hcmdpbnNbMl0pKSAvIG9wdGlvbnMuY2VsbHNbMV1cbiAgICAgICAgXTtcbiAgICBmb3IgKHZhciBhID0gMDsgYSA8IG9wdGlvbnMuY2VsbHNbcmV2RGlyZWN0aW9uXTsgYSsrKSB7XG4gICAgICAgIGZvciAodmFyIGIgPSAwOyBiIDwgb3B0aW9ucy5jZWxsc1tjb250ZXh0LmRpcmVjdGlvbl07IGIrKykge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBjb250ZXh0LmFsaWdubWVudCA/IGNvbnRleHQucHJldigpIDogY29udGV4dC5uZXh0KCk7XG4gICAgICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250ZXh0LnNldChub2RlLCB7XG4gICAgICAgICAgICAgICAgc2l6ZTogbm9kZVNpemUsXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAgICAgICAgIChub2RlU2l6ZVswXSArIHNwYWNpbmdbMF0pICogKHJldkRpcmVjdGlvbiA/IGIgOiBhKSArIG1hcmdpbnNbM10sXG4gICAgICAgICAgICAgICAgICAgIChub2RlU2l6ZVsxXSArIHNwYWNpbmdbMV0pICogKHJldkRpcmVjdGlvbiA/IGEgOiBiKSArIG1hcmdpbnNbMF0sXG4gICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbkdyaWRMYXlvdXQuQ2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0aWVzO1xubW9kdWxlLmV4cG9ydHMgPSBHcmlkTGF5b3V0OyIsInZhciBMYXlvdXREb2NrSGVscGVyID0gcmVxdWlyZSgnLi4vaGVscGVycy9MYXlvdXREb2NrSGVscGVyJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEhlYWRlckZvb3RlckxheW91dChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGRvY2sgPSBuZXcgTGF5b3V0RG9ja0hlbHBlcihjb250ZXh0LCBvcHRpb25zKTtcbiAgICBkb2NrLnRvcCgnaGVhZGVyJywgb3B0aW9ucy5oZWFkZXJTaXplIHx8IG9wdGlvbnMuaGVhZGVySGVpZ2h0KTtcbiAgICBkb2NrLmJvdHRvbSgnZm9vdGVyJywgb3B0aW9ucy5mb290ZXJTaXplIHx8IG9wdGlvbnMuZm9vdGVySGVpZ2h0KTtcbiAgICBkb2NrLmZpbGwoJ2NvbnRlbnQnKTtcbn07IiwidmFyIFV0aWxpdHkgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiBudWxsO1xudmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuLi9MYXlvdXRVdGlsaXR5Jyk7XG52YXIgY2FwYWJpbGl0aWVzID0ge1xuICAgICAgICBzZXF1ZW5jZTogdHJ1ZSxcbiAgICAgICAgZGlyZWN0aW9uOiBbXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5ZLFxuICAgICAgICAgICAgVXRpbGl0eS5EaXJlY3Rpb24uWFxuICAgICAgICBdLFxuICAgICAgICBzY3JvbGxpbmc6IHRydWUsXG4gICAgICAgIHRydWVTaXplOiB0cnVlLFxuICAgICAgICBzZXF1ZW50aWFsU2Nyb2xsaW5nT3B0aW1pemVkOiB0cnVlXG4gICAgfTtcbnZhciBzZXQgPSB7XG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHNjcm9sbExlbmd0aDogdW5kZWZpbmVkXG4gICAgfTtcbnZhciBtYXJnaW4gPSBbXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdO1xuZnVuY3Rpb24gTGlzdExheW91dChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIHNpemUgPSBjb250ZXh0LnNpemU7XG4gICAgdmFyIGRpcmVjdGlvbiA9IGNvbnRleHQuZGlyZWN0aW9uO1xuICAgIHZhciBhbGlnbm1lbnQgPSBjb250ZXh0LmFsaWdubWVudDtcbiAgICB2YXIgcmV2RGlyZWN0aW9uID0gZGlyZWN0aW9uID8gMCA6IDE7XG4gICAgdmFyIG9mZnNldDtcbiAgICB2YXIgbWFyZ2lucyA9IExheW91dFV0aWxpdHkubm9ybWFsaXplTWFyZ2lucyhvcHRpb25zLm1hcmdpbnMpO1xuICAgIHZhciBzcGFjaW5nID0gb3B0aW9ucy5zcGFjaW5nIHx8IDA7XG4gICAgdmFyIG5vZGU7XG4gICAgdmFyIG5vZGVTaXplO1xuICAgIHZhciBpdGVtU2l6ZTtcbiAgICB2YXIgZ2V0SXRlbVNpemU7XG4gICAgdmFyIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGw7XG4gICAgdmFyIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxPZmZzZXQ7XG4gICAgdmFyIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxMZW5ndGg7XG4gICAgdmFyIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxTY3JvbGxMZW5ndGg7XG4gICAgdmFyIGZpcnN0VmlzaWJsZUNlbGw7XG4gICAgdmFyIGxhc3ROb2RlO1xuICAgIHZhciBsYXN0Q2VsbE9mZnNldEluRmlyc3RWaXNpYmxlU2VjdGlvbjtcbiAgICB2YXIgaXNTZWN0aW9uQ2FsbGJhY2sgPSBvcHRpb25zLmlzU2VjdGlvbkNhbGxiYWNrO1xuICAgIHZhciBib3VuZDtcbiAgICBzZXQuc2l6ZVswXSA9IHNpemVbMF07XG4gICAgc2V0LnNpemVbMV0gPSBzaXplWzFdO1xuICAgIHNldC5zaXplW3JldkRpcmVjdGlvbl0gLT0gbWFyZ2luc1sxIC0gcmV2RGlyZWN0aW9uXSArIG1hcmdpbnNbMyAtIHJldkRpcmVjdGlvbl07XG4gICAgc2V0LnRyYW5zbGF0ZVswXSA9IDA7XG4gICAgc2V0LnRyYW5zbGF0ZVsxXSA9IDA7XG4gICAgc2V0LnRyYW5zbGF0ZVsyXSA9IDA7XG4gICAgc2V0LnRyYW5zbGF0ZVtyZXZEaXJlY3Rpb25dID0gbWFyZ2luc1tkaXJlY3Rpb24gPyAzIDogMF07XG4gICAgaWYgKG9wdGlvbnMuaXRlbVNpemUgPT09IHRydWUgfHwgIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ2l0ZW1TaXplJykpIHtcbiAgICAgICAgaXRlbVNpemUgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5pdGVtU2l6ZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgIGdldEl0ZW1TaXplID0gb3B0aW9ucy5pdGVtU2l6ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpdGVtU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemUgPT09IHVuZGVmaW5lZCA/IHNpemVbZGlyZWN0aW9uXSA6IG9wdGlvbnMuaXRlbVNpemU7XG4gICAgfVxuICAgIG1hcmdpblswXSA9IG1hcmdpbnNbZGlyZWN0aW9uID8gMCA6IDNdO1xuICAgIG1hcmdpblsxXSA9IC1tYXJnaW5zW2RpcmVjdGlvbiA/IDIgOiAxXTtcbiAgICBvZmZzZXQgPSBjb250ZXh0LnNjcm9sbE9mZnNldCArIG1hcmdpblthbGlnbm1lbnRdO1xuICAgIGJvdW5kID0gY29udGV4dC5zY3JvbGxFbmQgKyBtYXJnaW5bYWxpZ25tZW50XTtcbiAgICB3aGlsZSAob2Zmc2V0IDwgYm91bmQpIHtcbiAgICAgICAgbGFzdE5vZGUgPSBub2RlO1xuICAgICAgICBub2RlID0gY29udGV4dC5uZXh0KCk7XG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgaWYgKGxhc3ROb2RlICYmICFhbGlnbm1lbnQpIHtcbiAgICAgICAgICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoID0gbm9kZVNpemUgKyBtYXJnaW5bMF0gKyAtbWFyZ2luWzFdO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuc2V0KGxhc3ROb2RlLCBzZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZVNpemUgPSBnZXRJdGVtU2l6ZSA/IGdldEl0ZW1TaXplKG5vZGUucmVuZGVyTm9kZSkgOiBpdGVtU2l6ZTtcbiAgICAgICAgbm9kZVNpemUgPSBub2RlU2l6ZSA9PT0gdHJ1ZSA/IGNvbnRleHQucmVzb2x2ZVNpemUobm9kZSwgc2l6ZSlbZGlyZWN0aW9uXSA6IG5vZGVTaXplO1xuICAgICAgICBzZXQuc2l6ZVtkaXJlY3Rpb25dID0gbm9kZVNpemU7XG4gICAgICAgIHNldC50cmFuc2xhdGVbZGlyZWN0aW9uXSA9IG9mZnNldCArIChhbGlnbm1lbnQgPyBzcGFjaW5nIDogMCk7XG4gICAgICAgIHNldC5zY3JvbGxMZW5ndGggPSBub2RlU2l6ZSArIHNwYWNpbmc7XG4gICAgICAgIGNvbnRleHQuc2V0KG5vZGUsIHNldCk7XG4gICAgICAgIG9mZnNldCArPSBzZXQuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICBpZiAoaXNTZWN0aW9uQ2FsbGJhY2sgJiYgaXNTZWN0aW9uQ2FsbGJhY2sobm9kZS5yZW5kZXJOb2RlKSkge1xuICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gTWF0aC5tYXgobWFyZ2luWzBdLCBzZXQudHJhbnNsYXRlW2RpcmVjdGlvbl0pO1xuICAgICAgICAgICAgY29udGV4dC5zZXQobm9kZSwgc2V0KTtcbiAgICAgICAgICAgIGlmICghZmlyc3RWaXNpYmxlQ2VsbCkge1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGwgPSBub2RlO1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxPZmZzZXQgPSBvZmZzZXQgLSBub2RlU2l6ZTtcbiAgICAgICAgICAgICAgICBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsTGVuZ3RoID0gbm9kZVNpemU7XG4gICAgICAgICAgICAgICAgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbFNjcm9sbExlbmd0aCA9IG5vZGVTaXplO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsYXN0Q2VsbE9mZnNldEluRmlyc3RWaXNpYmxlU2VjdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbGFzdENlbGxPZmZzZXRJbkZpcnN0VmlzaWJsZVNlY3Rpb24gPSBvZmZzZXQgLSBub2RlU2l6ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghZmlyc3RWaXNpYmxlQ2VsbCAmJiBvZmZzZXQgPj0gMCkge1xuICAgICAgICAgICAgZmlyc3RWaXNpYmxlQ2VsbCA9IG5vZGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbm9kZSA9IHVuZGVmaW5lZDtcbiAgICBvZmZzZXQgPSBjb250ZXh0LnNjcm9sbE9mZnNldCArIG1hcmdpblthbGlnbm1lbnRdO1xuICAgIGJvdW5kID0gY29udGV4dC5zY3JvbGxTdGFydCArIG1hcmdpblthbGlnbm1lbnRdO1xuICAgIHdoaWxlIChvZmZzZXQgPiBib3VuZCkge1xuICAgICAgICBsYXN0Tm9kZSA9IG5vZGU7XG4gICAgICAgIG5vZGUgPSBjb250ZXh0LnByZXYoKTtcbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICBpZiAobGFzdE5vZGUgJiYgYWxpZ25tZW50KSB7XG4gICAgICAgICAgICAgICAgc2V0LnNjcm9sbExlbmd0aCA9IG5vZGVTaXplICsgbWFyZ2luWzBdICsgLW1hcmdpblsxXTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LnNldChsYXN0Tm9kZSwgc2V0KTtcbiAgICAgICAgICAgICAgICBpZiAobGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbCA9PT0gbGFzdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbFNjcm9sbExlbmd0aCA9IHNldC5zY3JvbGxMZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZVNpemUgPSBnZXRJdGVtU2l6ZSA/IGdldEl0ZW1TaXplKG5vZGUucmVuZGVyTm9kZSkgOiBpdGVtU2l6ZTtcbiAgICAgICAgbm9kZVNpemUgPSBub2RlU2l6ZSA9PT0gdHJ1ZSA/IGNvbnRleHQucmVzb2x2ZVNpemUobm9kZSwgc2l6ZSlbZGlyZWN0aW9uXSA6IG5vZGVTaXplO1xuICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoID0gbm9kZVNpemUgKyBzcGFjaW5nO1xuICAgICAgICBvZmZzZXQgLT0gc2V0LnNjcm9sbExlbmd0aDtcbiAgICAgICAgc2V0LnNpemVbZGlyZWN0aW9uXSA9IG5vZGVTaXplO1xuICAgICAgICBzZXQudHJhbnNsYXRlW2RpcmVjdGlvbl0gPSBvZmZzZXQgKyAoYWxpZ25tZW50ID8gc3BhY2luZyA6IDApO1xuICAgICAgICBjb250ZXh0LnNldChub2RlLCBzZXQpO1xuICAgICAgICBpZiAoaXNTZWN0aW9uQ2FsbGJhY2sgJiYgaXNTZWN0aW9uQ2FsbGJhY2sobm9kZS5yZW5kZXJOb2RlKSkge1xuICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gTWF0aC5tYXgobWFyZ2luWzBdLCBzZXQudHJhbnNsYXRlW2RpcmVjdGlvbl0pO1xuICAgICAgICAgICAgY29udGV4dC5zZXQobm9kZSwgc2V0KTtcbiAgICAgICAgICAgIGlmICghbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbCkge1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGwgPSBub2RlO1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxPZmZzZXQgPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbExlbmd0aCA9IG5vZGVTaXplO1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxTY3JvbGxMZW5ndGggPSBzZXQuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG9mZnNldCArIG5vZGVTaXplID49IDApIHtcbiAgICAgICAgICAgIGZpcnN0VmlzaWJsZUNlbGwgPSBub2RlO1xuICAgICAgICAgICAgaWYgKGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGwpIHtcbiAgICAgICAgICAgICAgICBsYXN0Q2VsbE9mZnNldEluRmlyc3RWaXNpYmxlU2VjdGlvbiA9IG9mZnNldCArIG5vZGVTaXplO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNTZWN0aW9uQ2FsbGJhY2sgJiYgIWxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGwpIHtcbiAgICAgICAgbm9kZSA9IGNvbnRleHQucHJldigpO1xuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgaWYgKGlzU2VjdGlvbkNhbGxiYWNrKG5vZGUucmVuZGVyTm9kZSkpIHtcbiAgICAgICAgICAgICAgICBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsID0gbm9kZTtcbiAgICAgICAgICAgICAgICBub2RlU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemUgfHwgY29udGV4dC5yZXNvbHZlU2l6ZShub2RlLCBzaXplKVtkaXJlY3Rpb25dO1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxPZmZzZXQgPSBvZmZzZXQgLSBub2RlU2l6ZTtcbiAgICAgICAgICAgICAgICBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsTGVuZ3RoID0gbm9kZVNpemU7XG4gICAgICAgICAgICAgICAgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbFNjcm9sbExlbmd0aCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IGNvbnRleHQucHJldigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsKSB7XG4gICAgICAgIHZhciBjb3JyZWN0ZWRPZmZzZXQgPSBNYXRoLm1heChtYXJnaW5bMF0sIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxPZmZzZXQpO1xuICAgICAgICBpZiAobGFzdENlbGxPZmZzZXRJbkZpcnN0VmlzaWJsZVNlY3Rpb24gIT09IHVuZGVmaW5lZCAmJiBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsTGVuZ3RoID4gbGFzdENlbGxPZmZzZXRJbkZpcnN0VmlzaWJsZVNlY3Rpb24gLSBtYXJnaW5bMF0pIHtcbiAgICAgICAgICAgIGNvcnJlY3RlZE9mZnNldCA9IGxhc3RDZWxsT2Zmc2V0SW5GaXJzdFZpc2libGVTZWN0aW9uIC0gbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbExlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBzZXQuc2l6ZVtkaXJlY3Rpb25dID0gbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbExlbmd0aDtcbiAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gY29ycmVjdGVkT2Zmc2V0O1xuICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoID0gbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbFNjcm9sbExlbmd0aDtcbiAgICAgICAgY29udGV4dC5zZXQobGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbCwgc2V0KTtcbiAgICB9XG59XG5MaXN0TGF5b3V0LkNhcGFiaWxpdGllcyA9IGNhcGFiaWxpdGllcztcbkxpc3RMYXlvdXQuTmFtZSA9ICdMaXN0TGF5b3V0Jztcbkxpc3RMYXlvdXQuRGVzY3JpcHRpb24gPSAnTGlzdC1sYXlvdXQgd2l0aCBtYXJnaW5zLCBzcGFjaW5nIGFuZCBzdGlja3kgaGVhZGVycyc7XG5tb2R1bGUuZXhwb3J0cyA9IExpc3RMYXlvdXQ7IiwidmFyIExheW91dERvY2tIZWxwZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL0xheW91dERvY2tIZWxwZXInKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gTmF2QmFyTGF5b3V0KGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgZG9jayA9IG5ldyBMYXlvdXREb2NrSGVscGVyKGNvbnRleHQsIHtcbiAgICAgICAgICAgIG1hcmdpbnM6IG9wdGlvbnMubWFyZ2lucyxcbiAgICAgICAgICAgIHRyYW5zbGF0ZVo6IDFcbiAgICAgICAgfSk7XG4gICAgY29udGV4dC5zZXQoJ2JhY2tncm91bmQnLCB7IHNpemU6IGNvbnRleHQuc2l6ZSB9KTtcbiAgICB2YXIgbm9kZTtcbiAgICB2YXIgaTtcbiAgICB2YXIgcmlnaHRJdGVtcyA9IGNvbnRleHQuZ2V0KCdyaWdodEl0ZW1zJyk7XG4gICAgaWYgKHJpZ2h0SXRlbXMpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHJpZ2h0SXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG5vZGUgPSBjb250ZXh0LmdldChyaWdodEl0ZW1zW2ldKTtcbiAgICAgICAgICAgIGRvY2sucmlnaHQobm9kZSwgb3B0aW9ucy5yaWdodEl0ZW1XaWR0aCB8fCBvcHRpb25zLml0ZW1XaWR0aCk7XG4gICAgICAgICAgICBkb2NrLnJpZ2h0KHVuZGVmaW5lZCwgb3B0aW9ucy5yaWdodEl0ZW1TcGFjZXIgfHwgb3B0aW9ucy5pdGVtU3BhY2VyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgbGVmdEl0ZW1zID0gY29udGV4dC5nZXQoJ2xlZnRJdGVtcycpO1xuICAgIGlmIChsZWZ0SXRlbXMpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlZnRJdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbm9kZSA9IGNvbnRleHQuZ2V0KGxlZnRJdGVtc1tpXSk7XG4gICAgICAgICAgICBkb2NrLmxlZnQobm9kZSwgb3B0aW9ucy5sZWZ0SXRlbVdpZHRoIHx8IG9wdGlvbnMuaXRlbVdpZHRoKTtcbiAgICAgICAgICAgIGRvY2subGVmdCh1bmRlZmluZWQsIG9wdGlvbnMubGVmdEl0ZW1TcGFjZXIgfHwgb3B0aW9ucy5pdGVtU3BhY2VyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkb2NrLmZpbGwoJ3RpdGxlJyk7XG59OyIsInZhciBVdGlsaXR5ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLnV0aWxpdGllcy5VdGlsaXR5IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnV0aWxpdGllcy5VdGlsaXR5IDogbnVsbDtcbnZhciBjYXBhYmlsaXRpZXMgPSB7XG4gICAgICAgIHNlcXVlbmNlOiB0cnVlLFxuICAgICAgICBkaXJlY3Rpb246IFtcbiAgICAgICAgICAgIFV0aWxpdHkuRGlyZWN0aW9uLlksXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5YXG4gICAgICAgIF0sXG4gICAgICAgIHNjcm9sbGluZzogZmFsc2VcbiAgICB9O1xudmFyIGRpcmVjdGlvbjtcbnZhciBzaXplO1xudmFyIHJhdGlvcztcbnZhciB0b3RhbDtcbnZhciBvZmZzZXQ7XG52YXIgaW5kZXg7XG52YXIgbm9kZTtcbnZhciBzZXQgPSB7XG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF1cbiAgICB9O1xuZnVuY3Rpb24gUHJvcG9ydGlvbmFsTGF5b3V0KGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBzaXplID0gY29udGV4dC5zaXplO1xuICAgIGRpcmVjdGlvbiA9IGNvbnRleHQuZGlyZWN0aW9uO1xuICAgIHJhdGlvcyA9IG9wdGlvbnMucmF0aW9zO1xuICAgIHRvdGFsID0gMDtcbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCByYXRpb3MubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIHRvdGFsICs9IHJhdGlvc1tpbmRleF07XG4gICAgfVxuICAgIHNldC5zaXplWzBdID0gc2l6ZVswXTtcbiAgICBzZXQuc2l6ZVsxXSA9IHNpemVbMV07XG4gICAgc2V0LnRyYW5zbGF0ZVswXSA9IDA7XG4gICAgc2V0LnRyYW5zbGF0ZVsxXSA9IDA7XG4gICAgbm9kZSA9IGNvbnRleHQubmV4dCgpO1xuICAgIG9mZnNldCA9IDA7XG4gICAgaW5kZXggPSAwO1xuICAgIHdoaWxlIChub2RlICYmIGluZGV4IDwgcmF0aW9zLmxlbmd0aCkge1xuICAgICAgICBzZXQuc2l6ZVtkaXJlY3Rpb25dID0gKHNpemVbZGlyZWN0aW9uXSAtIG9mZnNldCkgLyB0b3RhbCAqIHJhdGlvc1tpbmRleF07XG4gICAgICAgIHNldC50cmFuc2xhdGVbZGlyZWN0aW9uXSA9IG9mZnNldDtcbiAgICAgICAgY29udGV4dC5zZXQobm9kZSwgc2V0KTtcbiAgICAgICAgb2Zmc2V0ICs9IHNldC5zaXplW2RpcmVjdGlvbl07XG4gICAgICAgIHRvdGFsIC09IHJhdGlvc1tpbmRleF07XG4gICAgICAgIGluZGV4Kys7XG4gICAgICAgIG5vZGUgPSBjb250ZXh0Lm5leHQoKTtcbiAgICB9XG59XG5Qcm9wb3J0aW9uYWxMYXlvdXQuQ2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0aWVzO1xubW9kdWxlLmV4cG9ydHMgPSBQcm9wb3J0aW9uYWxMYXlvdXQ7IiwidmFyIFV0aWxpdHkgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiBudWxsO1xudmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuLi9MYXlvdXRVdGlsaXR5Jyk7XG52YXIgY2FwYWJpbGl0aWVzID0ge1xuICAgICAgICBzZXF1ZW5jZTogdHJ1ZSxcbiAgICAgICAgZGlyZWN0aW9uOiBbXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5YLFxuICAgICAgICAgICAgVXRpbGl0eS5EaXJlY3Rpb24uWVxuICAgICAgICBdLFxuICAgICAgICB0cnVlU2l6ZTogdHJ1ZVxuICAgIH07XG52YXIgc2l6ZTtcbnZhciBkaXJlY3Rpb247XG52YXIgcmV2RGlyZWN0aW9uO1xudmFyIGl0ZW1zO1xudmFyIHNwYWNlcnM7XG52YXIgbWFyZ2lucztcbnZhciBzcGFjaW5nO1xudmFyIHNpemVMZWZ0O1xudmFyIHNldCA9IHtcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgYWxpZ246IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXVxuICAgIH07XG52YXIgbm9kZVNpemU7XG52YXIgb2Zmc2V0O1xuZnVuY3Rpb24gTmF2QmFyTGF5b3V0KGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBzaXplID0gY29udGV4dC5zaXplO1xuICAgIGRpcmVjdGlvbiA9IGNvbnRleHQuZGlyZWN0aW9uO1xuICAgIHJldkRpcmVjdGlvbiA9IGRpcmVjdGlvbiA/IDAgOiAxO1xuICAgIHNwYWNpbmcgPSBvcHRpb25zLnNwYWNpbmcgfHwgMDtcbiAgICBpdGVtcyA9IGNvbnRleHQuZ2V0KCdpdGVtcycpO1xuICAgIHNwYWNlcnMgPSBjb250ZXh0LmdldCgnc3BhY2VycycpO1xuICAgIG1hcmdpbnMgPSBMYXlvdXRVdGlsaXR5Lm5vcm1hbGl6ZU1hcmdpbnMob3B0aW9ucy5tYXJnaW5zKTtcbiAgICBzZXQuc2l6ZVswXSA9IGNvbnRleHQuc2l6ZVswXTtcbiAgICBzZXQuc2l6ZVsxXSA9IGNvbnRleHQuc2l6ZVsxXTtcbiAgICBzZXQuc2l6ZVtyZXZEaXJlY3Rpb25dIC09IG1hcmdpbnNbMSAtIHJldkRpcmVjdGlvbl0gKyBtYXJnaW5zWzMgLSByZXZEaXJlY3Rpb25dO1xuICAgIHNldC50cmFuc2xhdGVbMF0gPSAwO1xuICAgIHNldC50cmFuc2xhdGVbMV0gPSAwO1xuICAgIHNldC50cmFuc2xhdGVbMl0gPSAwLjAwMTtcbiAgICBzZXQudHJhbnNsYXRlW3JldkRpcmVjdGlvbl0gPSBtYXJnaW5zW2RpcmVjdGlvbiA/IDMgOiAwXTtcbiAgICBzZXQuYWxpZ25bMF0gPSAwO1xuICAgIHNldC5hbGlnblsxXSA9IDA7XG4gICAgc2V0Lm9yaWdpblswXSA9IDA7XG4gICAgc2V0Lm9yaWdpblsxXSA9IDA7XG4gICAgb2Zmc2V0ID0gZGlyZWN0aW9uID8gbWFyZ2luc1swXSA6IG1hcmdpbnNbM107XG4gICAgc2l6ZUxlZnQgPSBzaXplW2RpcmVjdGlvbl0gLSAob2Zmc2V0ICsgKGRpcmVjdGlvbiA/IG1hcmdpbnNbMl0gOiBtYXJnaW5zWzFdKSk7XG4gICAgc2l6ZUxlZnQgLT0gKGl0ZW1zLmxlbmd0aCAtIDEpICogc3BhY2luZztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChvcHRpb25zLml0ZW1TaXplID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG5vZGVTaXplID0gTWF0aC5yb3VuZChzaXplTGVmdCAvIChpdGVtcy5sZW5ndGggLSBpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub2RlU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemUgPT09IHRydWUgPyBjb250ZXh0LnJlc29sdmVTaXplKGl0ZW1zW2ldLCBzaXplKVtkaXJlY3Rpb25dIDogb3B0aW9ucy5pdGVtU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoID0gbm9kZVNpemU7XG4gICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoICs9IGRpcmVjdGlvbiA/IG1hcmdpbnNbMF0gOiBtYXJnaW5zWzNdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpID09PSBpdGVtcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoICs9IGRpcmVjdGlvbiA/IG1hcmdpbnNbMl0gOiBtYXJnaW5zWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0LnNjcm9sbExlbmd0aCArPSBzcGFjaW5nO1xuICAgICAgICB9XG4gICAgICAgIHNldC5zaXplW2RpcmVjdGlvbl0gPSBub2RlU2l6ZTtcbiAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gb2Zmc2V0O1xuICAgICAgICBjb250ZXh0LnNldChpdGVtc1tpXSwgc2V0KTtcbiAgICAgICAgb2Zmc2V0ICs9IG5vZGVTaXplO1xuICAgICAgICBzaXplTGVmdCAtPSBub2RlU2l6ZTtcbiAgICAgICAgaWYgKGkgPT09IG9wdGlvbnMuc2VsZWN0ZWRJdGVtSW5kZXgpIHtcbiAgICAgICAgICAgIHNldC5zY3JvbGxMZW5ndGggPSAwO1xuICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dICs9IG5vZGVTaXplIC8gMjtcbiAgICAgICAgICAgIHNldC50cmFuc2xhdGVbMl0gPSAwLjAwMjtcbiAgICAgICAgICAgIHNldC5vcmlnaW5bZGlyZWN0aW9uXSA9IDAuNTtcbiAgICAgICAgICAgIGNvbnRleHQuc2V0KCdzZWxlY3RlZEl0ZW1PdmVybGF5Jywgc2V0KTtcbiAgICAgICAgICAgIHNldC5vcmlnaW5bZGlyZWN0aW9uXSA9IDA7XG4gICAgICAgICAgICBzZXQudHJhbnNsYXRlWzJdID0gMC4wMDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgPCBpdGVtcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBpZiAoc3BhY2VycyAmJiBpIDwgc3BhY2Vycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBzZXQuc2l6ZVtkaXJlY3Rpb25dID0gc3BhY2luZztcbiAgICAgICAgICAgICAgICBzZXQudHJhbnNsYXRlW2RpcmVjdGlvbl0gPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgY29udGV4dC5zZXQoc3BhY2Vyc1tpXSwgc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9mZnNldCArPSBzcGFjaW5nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2Zmc2V0ICs9IGRpcmVjdGlvbiA/IG1hcmdpbnNbMl0gOiBtYXJnaW5zWzFdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHNldC5zY3JvbGxMZW5ndGggPSAwO1xuICAgIHNldC5zaXplW2RpcmVjdGlvbl0gPSBzaXplW2RpcmVjdGlvbl07XG4gICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gMDtcbiAgICBzZXQudHJhbnNsYXRlWzJdID0gMDtcbiAgICBjb250ZXh0LnNldCgnYmFja2dyb3VuZCcsIHNldCk7XG59XG5OYXZCYXJMYXlvdXQuQ2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0aWVzO1xuTmF2QmFyTGF5b3V0Lk5hbWUgPSAnVGFiQmFyTGF5b3V0Jztcbk5hdkJhckxheW91dC5EZXNjcmlwdGlvbiA9ICdUYWJCYXIgd2lkZ2V0IGxheW91dCc7XG5tb2R1bGUuZXhwb3J0cyA9IE5hdkJhckxheW91dDsiLCJ2YXIgVXRpbGl0eSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IG51bGw7XG52YXIgY2FwYWJpbGl0aWVzID0ge1xuICAgICAgICBzZXF1ZW5jZTogdHJ1ZSxcbiAgICAgICAgZGlyZWN0aW9uOiBbXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5ZLFxuICAgICAgICAgICAgVXRpbGl0eS5EaXJlY3Rpb24uWFxuICAgICAgICBdLFxuICAgICAgICBzY3JvbGxpbmc6IHRydWUsXG4gICAgICAgIHRydWVTaXplOiB0cnVlXG4gICAgfTtcbnZhciBzaXplO1xudmFyIGRpcmVjdGlvbjtcbnZhciByZXZEaXJlY3Rpb247XG52YXIgbm9kZTtcbnZhciBpdGVtU2l6ZTtcbnZhciBkaWFtZXRlcjtcbnZhciBvZmZzZXQ7XG52YXIgYm91bmQ7XG52YXIgYW5nbGU7XG52YXIgcmFkaXVzO1xudmFyIGl0ZW1BbmdsZTtcbnZhciByYWRpYWxPcGFjaXR5O1xudmFyIHNldCA9IHtcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgcm90YXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgb3JpZ2luOiBbXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAwLjVcbiAgICAgICAgXSxcbiAgICAgICAgYWxpZ246IFtcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDAuNVxuICAgICAgICBdLFxuICAgICAgICBzY3JvbGxMZW5ndGg6IHVuZGVmaW5lZFxuICAgIH07XG5mdW5jdGlvbiBXaGVlbExheW91dChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgc2l6ZSA9IGNvbnRleHQuc2l6ZTtcbiAgICBkaXJlY3Rpb24gPSBjb250ZXh0LmRpcmVjdGlvbjtcbiAgICByZXZEaXJlY3Rpb24gPSBkaXJlY3Rpb24gPyAwIDogMTtcbiAgICBpdGVtU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemUgfHwgc2l6ZVtkaXJlY3Rpb25dIC8gMjtcbiAgICBkaWFtZXRlciA9IG9wdGlvbnMuZGlhbWV0ZXIgfHwgaXRlbVNpemUgKiAzO1xuICAgIHJhZGl1cyA9IGRpYW1ldGVyIC8gMjtcbiAgICBpdGVtQW5nbGUgPSBNYXRoLmF0YW4yKGl0ZW1TaXplIC8gMiwgcmFkaXVzKSAqIDI7XG4gICAgcmFkaWFsT3BhY2l0eSA9IG9wdGlvbnMucmFkaWFsT3BhY2l0eSA9PT0gdW5kZWZpbmVkID8gMSA6IG9wdGlvbnMucmFkaWFsT3BhY2l0eTtcbiAgICBzZXQub3BhY2l0eSA9IDE7XG4gICAgc2V0LnNpemVbMF0gPSBzaXplWzBdO1xuICAgIHNldC5zaXplWzFdID0gc2l6ZVsxXTtcbiAgICBzZXQuc2l6ZVtyZXZEaXJlY3Rpb25dID0gc2l6ZVtyZXZEaXJlY3Rpb25dO1xuICAgIHNldC5zaXplW2RpcmVjdGlvbl0gPSBpdGVtU2l6ZTtcbiAgICBzZXQudHJhbnNsYXRlWzBdID0gMDtcbiAgICBzZXQudHJhbnNsYXRlWzFdID0gMDtcbiAgICBzZXQudHJhbnNsYXRlWzJdID0gMDtcbiAgICBzZXQucm90YXRlWzBdID0gMDtcbiAgICBzZXQucm90YXRlWzFdID0gMDtcbiAgICBzZXQucm90YXRlWzJdID0gMDtcbiAgICBzZXQuc2Nyb2xsTGVuZ3RoID0gaXRlbVNpemU7XG4gICAgb2Zmc2V0ID0gY29udGV4dC5zY3JvbGxPZmZzZXQ7XG4gICAgYm91bmQgPSBNYXRoLlBJIC8gMiAvIGl0ZW1BbmdsZSAqIGl0ZW1TaXplICsgaXRlbVNpemU7XG4gICAgd2hpbGUgKG9mZnNldCA8PSBib3VuZCkge1xuICAgICAgICBub2RlID0gY29udGV4dC5uZXh0KCk7XG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9mZnNldCA+PSAtYm91bmQpIHtcbiAgICAgICAgICAgIGFuZ2xlID0gb2Zmc2V0IC8gaXRlbVNpemUgKiBpdGVtQW5nbGU7XG4gICAgICAgICAgICBzZXQudHJhbnNsYXRlW2RpcmVjdGlvbl0gPSByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgICAgICBzZXQudHJhbnNsYXRlWzJdID0gcmFkaXVzICogTWF0aC5jb3MoYW5nbGUpIC0gcmFkaXVzO1xuICAgICAgICAgICAgc2V0LnJvdGF0ZVtyZXZEaXJlY3Rpb25dID0gZGlyZWN0aW9uID8gLWFuZ2xlIDogYW5nbGU7XG4gICAgICAgICAgICBzZXQub3BhY2l0eSA9IDEgLSBNYXRoLmFicyhhbmdsZSkgLyAoTWF0aC5QSSAvIDIpICogKDEgLSByYWRpYWxPcGFjaXR5KTtcbiAgICAgICAgICAgIGNvbnRleHQuc2V0KG5vZGUsIHNldCk7XG4gICAgICAgIH1cbiAgICAgICAgb2Zmc2V0ICs9IGl0ZW1TaXplO1xuICAgIH1cbiAgICBvZmZzZXQgPSBjb250ZXh0LnNjcm9sbE9mZnNldCAtIGl0ZW1TaXplO1xuICAgIHdoaWxlIChvZmZzZXQgPj0gLWJvdW5kKSB7XG4gICAgICAgIG5vZGUgPSBjb250ZXh0LnByZXYoKTtcbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAob2Zmc2V0IDw9IGJvdW5kKSB7XG4gICAgICAgICAgICBhbmdsZSA9IG9mZnNldCAvIGl0ZW1TaXplICogaXRlbUFuZ2xlO1xuICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVsyXSA9IHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKSAtIHJhZGl1cztcbiAgICAgICAgICAgIHNldC5yb3RhdGVbcmV2RGlyZWN0aW9uXSA9IGRpcmVjdGlvbiA/IC1hbmdsZSA6IGFuZ2xlO1xuICAgICAgICAgICAgc2V0Lm9wYWNpdHkgPSAxIC0gTWF0aC5hYnMoYW5nbGUpIC8gKE1hdGguUEkgLyAyKSAqICgxIC0gcmFkaWFsT3BhY2l0eSk7XG4gICAgICAgICAgICBjb250ZXh0LnNldChub2RlLCBzZXQpO1xuICAgICAgICB9XG4gICAgICAgIG9mZnNldCAtPSBpdGVtU2l6ZTtcbiAgICB9XG59XG5XaGVlbExheW91dC5DYXBhYmlsaXRpZXMgPSBjYXBhYmlsaXRpZXM7XG5XaGVlbExheW91dC5OYW1lID0gJ1doZWVsTGF5b3V0JztcbldoZWVsTGF5b3V0LkRlc2NyaXB0aW9uID0gJ1NwaW5uZXItd2hlZWwvc2xvdC1tYWNoaW5lIGxheW91dCc7XG5tb2R1bGUuZXhwb3J0cyA9IFdoZWVsTGF5b3V0OyIsInZhciBWaWV3ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuVmlldyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLlZpZXcgOiBudWxsO1xudmFyIFN1cmZhY2UgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5TdXJmYWNlIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuU3VyZmFjZSA6IG51bGw7XG52YXIgVXRpbGl0eSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IG51bGw7XG52YXIgQ29udGFpbmVyU3VyZmFjZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5zdXJmYWNlcy5Db250YWluZXJTdXJmYWNlIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnN1cmZhY2VzLkNvbnRhaW5lclN1cmZhY2UgOiBudWxsO1xudmFyIExheW91dENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9MYXlvdXRDb250cm9sbGVyJyk7XG52YXIgU2Nyb2xsQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL1Njcm9sbENvbnRyb2xsZXInKTtcbnZhciBXaGVlbExheW91dCA9IHJlcXVpcmUoJy4uL2xheW91dHMvV2hlZWxMYXlvdXQnKTtcbnZhciBQcm9wb3J0aW9uYWxMYXlvdXQgPSByZXF1aXJlKCcuLi9sYXlvdXRzL1Byb3BvcnRpb25hbExheW91dCcpO1xudmFyIFZpcnR1YWxWaWV3U2VxdWVuY2UgPSByZXF1aXJlKCcuLi9WaXJ0dWFsVmlld1NlcXVlbmNlJyk7XG52YXIgRGF0ZVBpY2tlckNvbXBvbmVudHMgPSByZXF1aXJlKCcuL0RhdGVQaWNrZXJDb21wb25lbnRzJyk7XG52YXIgTGF5b3V0VXRpbGl0eSA9IHJlcXVpcmUoJy4uL0xheW91dFV0aWxpdHknKTtcbmZ1bmN0aW9uIERhdGVQaWNrZXIob3B0aW9ucykge1xuICAgIFZpZXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLl9kYXRlID0gbmV3IERhdGUob3B0aW9ucy5kYXRlID8gb3B0aW9ucy5kYXRlLmdldFRpbWUoKSA6IHVuZGVmaW5lZCk7XG4gICAgdGhpcy5fY29tcG9uZW50cyA9IFtdO1xuICAgIHRoaXMuY2xhc3NlcyA9IG9wdGlvbnMuY2xhc3NlcyA/IHRoaXMuY2xhc3Nlcy5jb25jYXQob3B0aW9ucy5jbGFzc2VzKSA6IHRoaXMuY2xhc3NlcztcbiAgICBfY3JlYXRlTGF5b3V0LmNhbGwodGhpcyk7XG4gICAgX3VwZGF0ZUNvbXBvbmVudHMuY2FsbCh0aGlzKTtcbiAgICB0aGlzLl9vdmVybGF5UmVuZGVyYWJsZXMgPSB7XG4gICAgICAgIHRvcDogdGhpcy5vcHRpb25zLnJlbmRlcmFibGVzLnRvcCA/IF9jcmVhdGVSZW5kZXJhYmxlLmNhbGwodGhpcywgJ3RvcCcpIDogdW5kZWZpbmVkLFxuICAgICAgICBtaWRkbGU6IHRoaXMub3B0aW9ucy5yZW5kZXJhYmxlcy5taWRkbGUgPyBfY3JlYXRlUmVuZGVyYWJsZS5jYWxsKHRoaXMsICdtaWRkbGUnKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgYm90dG9tOiB0aGlzLm9wdGlvbnMucmVuZGVyYWJsZXMuYm90dG9tID8gX2NyZWF0ZVJlbmRlcmFibGUuY2FsbCh0aGlzLCAnYm90dG9tJykgOiB1bmRlZmluZWRcbiAgICB9O1xuICAgIF9jcmVhdGVPdmVybGF5LmNhbGwodGhpcyk7XG4gICAgdGhpcy5zZXRPcHRpb25zKHRoaXMub3B0aW9ucyk7XG59XG5EYXRlUGlja2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmlldy5wcm90b3R5cGUpO1xuRGF0ZVBpY2tlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBEYXRlUGlja2VyO1xuRGF0ZVBpY2tlci5wcm90b3R5cGUuY2xhc3NlcyA9IFtcbiAgICAnZmYtd2lkZ2V0JyxcbiAgICAnZmYtZGF0ZXBpY2tlcidcbl07XG5EYXRlUGlja2VyLkNvbXBvbmVudCA9IERhdGVQaWNrZXJDb21wb25lbnRzO1xuRGF0ZVBpY2tlci5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgcGVyc3BlY3RpdmU6IDUwMCxcbiAgICB3aGVlbExheW91dDoge1xuICAgICAgICBpdGVtU2l6ZTogMTAwLFxuICAgICAgICBkaWFtZXRlcjogNTAwXG4gICAgfSxcbiAgICByZW5kZXJhYmxlczoge1xuICAgICAgICBiYWNrZ3JvdW5kOiBmYWxzZSxcbiAgICAgICAgdG9wOiBmYWxzZSxcbiAgICAgICAgbWlkZGxlOiBmYWxzZSxcbiAgICAgICAgYm90dG9tOiBmYWxzZVxuICAgIH0sXG4gICAgc2Nyb2xsQ29udHJvbGxlcjoge1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICBwYWdpbmF0ZWQ6IHRydWUsXG4gICAgICAgIHBhZ2luYXRpb25Nb2RlOiBTY3JvbGxDb250cm9sbGVyLlBhZ2luYXRpb25Nb2RlLlNDUk9MTCxcbiAgICAgICAgbW91c2VNb3ZlOiB0cnVlLFxuICAgICAgICBzY3JvbGxTcHJpbmc6IHtcbiAgICAgICAgICAgIGRhbXBpbmdSYXRpbzogMSxcbiAgICAgICAgICAgIHBlcmlvZDogODAwXG4gICAgICAgIH1cbiAgICB9XG59O1xuZnVuY3Rpb24gX2NyZWF0ZVJlbmRlcmFibGUoaWQsIGRhdGEpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmNyZWF0ZVJlbmRlcmFibGUpIHtcbiAgICAgICAgdmFyIHJlbmRlcmFibGUgPSB0aGlzLm9wdGlvbnMuY3JlYXRlUmVuZGVyYWJsZS5jYWxsKHRoaXMsIGlkLCBkYXRhKTtcbiAgICAgICAgaWYgKHJlbmRlcmFibGUpIHtcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJhYmxlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChkYXRhICE9PSB1bmRlZmluZWQgJiYgZGF0YSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgdmFyIHN1cmZhY2UgPSBuZXcgU3VyZmFjZSh7XG4gICAgICAgICAgICBjbGFzc2VzOiB0aGlzLmNsYXNzZXMsXG4gICAgICAgICAgICBjb250ZW50OiBkYXRhID8gJzxkaXY+JyArIGRhdGEgKyAnPC9kaXY+JyA6IHVuZGVmaW5lZFxuICAgICAgICB9KTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShpZCkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc3VyZmFjZS5hZGRDbGFzcyhpZFtpXSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBzdXJmYWNlLmFkZENsYXNzKGlkKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1cmZhY2U7XG59XG5EYXRlUGlja2VyLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBWaWV3LnByb3RvdHlwZS5zZXRPcHRpb25zLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgaWYgKCF0aGlzLmxheW91dCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMucGVyc3BlY3RpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5jb250ZXh0LnNldFBlcnNwZWN0aXZlKG9wdGlvbnMucGVyc3BlY3RpdmUpO1xuICAgIH1cbiAgICB2YXIgaTtcbiAgICBpZiAob3B0aW9ucy53aGVlbExheW91dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnNjcm9sbFdoZWVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxXaGVlbHNbaV0uc2Nyb2xsQ29udHJvbGxlci5zZXRMYXlvdXRPcHRpb25zKG9wdGlvbnMud2hlZWxMYXlvdXQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub3ZlcmxheS5zZXRMYXlvdXRPcHRpb25zKHsgaXRlbVNpemU6IHRoaXMub3B0aW9ucy53aGVlbExheW91dC5pdGVtU2l6ZSB9KTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuc2Nyb2xsQ29udHJvbGxlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnNjcm9sbFdoZWVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxXaGVlbHNbaV0uc2Nyb2xsQ29udHJvbGxlci5zZXRPcHRpb25zKG9wdGlvbnMuc2Nyb2xsQ29udHJvbGxlcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRGF0ZVBpY2tlci5wcm90b3R5cGUuc2V0Q29tcG9uZW50cyA9IGZ1bmN0aW9uIChjb21wb25lbnRzKSB7XG4gICAgdGhpcy5fY29tcG9uZW50cyA9IGNvbXBvbmVudHM7XG4gICAgX3VwZGF0ZUNvbXBvbmVudHMuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5EYXRlUGlja2VyLnByb3RvdHlwZS5nZXRDb21wb25lbnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9jb21wb25lbnRzO1xufTtcbkRhdGVQaWNrZXIucHJvdG90eXBlLnNldERhdGUgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgIHRoaXMuX2RhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSk7XG4gICAgX3NldERhdGVUb1Njcm9sbFdoZWVscy5jYWxsKHRoaXMsIHRoaXMuX2RhdGUpO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkRhdGVQaWNrZXIucHJvdG90eXBlLmdldERhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGU7XG59O1xuZnVuY3Rpb24gX3NldERhdGVUb1Njcm9sbFdoZWVscyhkYXRlKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNjcm9sbFdoZWVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc2Nyb2xsV2hlZWwgPSB0aGlzLnNjcm9sbFdoZWVsc1tpXTtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IHNjcm9sbFdoZWVsLmNvbXBvbmVudDtcbiAgICAgICAgdmFyIGl0ZW0gPSBzY3JvbGxXaGVlbC5zY3JvbGxDb250cm9sbGVyLmdldEZpcnN0VmlzaWJsZUl0ZW0oKTtcbiAgICAgICAgaWYgKGl0ZW0gJiYgaXRlbS52aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgIHZhciB2aWV3U2VxdWVuY2UgPSBpdGVtLnZpZXdTZXF1ZW5jZTtcbiAgICAgICAgICAgIHZhciByZW5kZXJOb2RlID0gaXRlbS52aWV3U2VxdWVuY2UuZ2V0KCk7XG4gICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gY29tcG9uZW50LmdldENvbXBvbmVudChyZW5kZXJOb2RlLmRhdGUpO1xuICAgICAgICAgICAgdmFyIGRlc3RWYWx1ZSA9IGNvbXBvbmVudC5nZXRDb21wb25lbnQoZGF0ZSk7XG4gICAgICAgICAgICB2YXIgc3RlcHMgPSAwO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRWYWx1ZSAhPT0gZGVzdFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgc3RlcHMgPSBkZXN0VmFsdWUgLSBjdXJyZW50VmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5sb29wKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXZTdGVwcyA9IHN0ZXBzIDwgMCA/IHN0ZXBzICsgY29tcG9uZW50LnVwcGVyQm91bmQgOiBzdGVwcyAtIGNvbXBvbmVudC51cHBlckJvdW5kO1xuICAgICAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMocmV2U3RlcHMpIDwgTWF0aC5hYnMoc3RlcHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwcyA9IHJldlN0ZXBzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFzdGVwcykge1xuICAgICAgICAgICAgICAgIHNjcm9sbFdoZWVsLnNjcm9sbENvbnRyb2xsZXIuZ29Ub1JlbmRlck5vZGUocmVuZGVyTm9kZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdoaWxlIChjdXJyZW50VmFsdWUgIT09IGRlc3RWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2aWV3U2VxdWVuY2UgPSBzdGVwcyA+IDAgPyB2aWV3U2VxdWVuY2UuZ2V0TmV4dCgpIDogdmlld1NlcXVlbmNlLmdldFByZXZpb3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlck5vZGUgPSB2aWV3U2VxdWVuY2UgPyB2aWV3U2VxdWVuY2UuZ2V0KCkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFZhbHVlID0gY29tcG9uZW50LmdldENvbXBvbmVudChyZW5kZXJOb2RlLmRhdGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHMgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxXaGVlbC5zY3JvbGxDb250cm9sbGVyLmdvVG9OZXh0UGFnZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsV2hlZWwuc2Nyb2xsQ29udHJvbGxlci5nb1RvUHJldmlvdXNQYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBfZ2V0RGF0ZUZyb21TY3JvbGxXaGVlbHMoKSB7XG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSh0aGlzLl9kYXRlKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2Nyb2xsV2hlZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzY3JvbGxXaGVlbCA9IHRoaXMuc2Nyb2xsV2hlZWxzW2ldO1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gc2Nyb2xsV2hlZWwuY29tcG9uZW50O1xuICAgICAgICB2YXIgaXRlbSA9IHNjcm9sbFdoZWVsLnNjcm9sbENvbnRyb2xsZXIuZ2V0Rmlyc3RWaXNpYmxlSXRlbSgpO1xuICAgICAgICBpZiAoaXRlbSAmJiBpdGVtLnJlbmRlck5vZGUpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5zZXRDb21wb25lbnQoZGF0ZSwgY29tcG9uZW50LmdldENvbXBvbmVudChpdGVtLnJlbmRlck5vZGUuZGF0ZSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRlO1xufVxuZnVuY3Rpb24gX2NyZWF0ZUxheW91dCgpIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXJTdXJmYWNlKHRoaXMub3B0aW9ucy5jb250YWluZXIpO1xuICAgIHRoaXMuY29udGFpbmVyLnNldENsYXNzZXModGhpcy5jbGFzc2VzKTtcbiAgICB0aGlzLmxheW91dCA9IG5ldyBMYXlvdXRDb250cm9sbGVyKHtcbiAgICAgICAgbGF5b3V0OiBQcm9wb3J0aW9uYWxMYXlvdXQsXG4gICAgICAgIGxheW91dE9wdGlvbnM6IHsgcmF0aW9zOiBbXSB9LFxuICAgICAgICBkaXJlY3Rpb246IFV0aWxpdHkuRGlyZWN0aW9uLlhcbiAgICB9KTtcbiAgICB0aGlzLmNvbnRhaW5lci5hZGQodGhpcy5sYXlvdXQpO1xuICAgIHRoaXMuYWRkKHRoaXMuY29udGFpbmVyKTtcbn1cbmZ1bmN0aW9uIF9jbGlja0l0ZW0oc2Nyb2xsV2hlZWwsIGV2ZW50KSB7XG4gICAgaWYgKHNjcm9sbFdoZWVsICYmIGV2ZW50ICYmIGV2ZW50LnRhcmdldCkge1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9zY3JvbGxXaGVlbFNjcm9sbFN0YXJ0KCkge1xuICAgIHRoaXMuX3Njcm9sbGluZ0NvdW50Kys7XG4gICAgaWYgKHRoaXMuX3Njcm9sbGluZ0NvdW50ID09PSAxKSB7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3Njcm9sbHN0YXJ0JywgeyB0YXJnZXQ6IHRoaXMgfSk7XG4gICAgfVxufVxuZnVuY3Rpb24gX3Njcm9sbFdoZWVsU2Nyb2xsRW5kKCkge1xuICAgIHRoaXMuX3Njcm9sbGluZ0NvdW50LS07XG4gICAgaWYgKHRoaXMuX3Njcm9sbGluZ0NvdW50ID09PSAwKSB7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3Njcm9sbGVuZCcsIHtcbiAgICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICAgIGRhdGU6IHRoaXMuX2RhdGVcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZnVuY3Rpb24gX3Njcm9sbFdoZWVsUGFnZUNoYW5nZSgpIHtcbiAgICB0aGlzLl9kYXRlID0gX2dldERhdGVGcm9tU2Nyb2xsV2hlZWxzLmNhbGwodGhpcyk7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnZGF0ZWNoYW5nZScsIHtcbiAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICBkYXRlOiB0aGlzLl9kYXRlXG4gICAgfSk7XG59XG5mdW5jdGlvbiBfdXBkYXRlQ29tcG9uZW50cygpIHtcbiAgICB0aGlzLnNjcm9sbFdoZWVscyA9IFtdO1xuICAgIHRoaXMuX3Njcm9sbGluZ0NvdW50ID0gMDtcbiAgICB2YXIgZGF0YVNvdXJjZSA9IFtdO1xuICAgIHZhciBzaXplUmF0aW9zID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9jb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjb21wb25lbnQgPSB0aGlzLl9jb21wb25lbnRzW2ldO1xuICAgICAgICBjb21wb25lbnQuY3JlYXRlUmVuZGVyYWJsZSA9IF9jcmVhdGVSZW5kZXJhYmxlLmJpbmQodGhpcyk7XG4gICAgICAgIHZhciB2aWV3U2VxdWVuY2UgPSBuZXcgVmlydHVhbFZpZXdTZXF1ZW5jZSh7XG4gICAgICAgICAgICAgICAgZmFjdG9yeTogY29tcG9uZW50LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBjb21wb25lbnQuY3JlYXRlKHRoaXMuX2RhdGUpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBMYXlvdXRVdGlsaXR5LmNvbWJpbmVPcHRpb25zKHRoaXMub3B0aW9ucy5zY3JvbGxDb250cm9sbGVyLCB7XG4gICAgICAgICAgICAgICAgbGF5b3V0OiBXaGVlbExheW91dCxcbiAgICAgICAgICAgICAgICBsYXlvdXRPcHRpb25zOiB0aGlzLm9wdGlvbnMud2hlZWxMYXlvdXQsXG4gICAgICAgICAgICAgICAgZmxvdzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBVdGlsaXR5LkRpcmVjdGlvbi5ZLFxuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2U6IHZpZXdTZXF1ZW5jZSxcbiAgICAgICAgICAgICAgICBhdXRvUGlwZUV2ZW50czogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHZhciBzY3JvbGxDb250cm9sbGVyID0gbmV3IFNjcm9sbENvbnRyb2xsZXIob3B0aW9ucyk7XG4gICAgICAgIHNjcm9sbENvbnRyb2xsZXIub24oJ3Njcm9sbHN0YXJ0JywgX3Njcm9sbFdoZWVsU2Nyb2xsU3RhcnQuYmluZCh0aGlzKSk7XG4gICAgICAgIHNjcm9sbENvbnRyb2xsZXIub24oJ3Njcm9sbGVuZCcsIF9zY3JvbGxXaGVlbFNjcm9sbEVuZC5iaW5kKHRoaXMpKTtcbiAgICAgICAgc2Nyb2xsQ29udHJvbGxlci5vbigncGFnZWNoYW5nZScsIF9zY3JvbGxXaGVlbFBhZ2VDaGFuZ2UuYmluZCh0aGlzKSk7XG4gICAgICAgIHZhciBzY3JvbGxXaGVlbCA9IHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICBzY3JvbGxDb250cm9sbGVyOiBzY3JvbGxDb250cm9sbGVyLFxuICAgICAgICAgICAgICAgIHZpZXdTZXF1ZW5jZTogdmlld1NlcXVlbmNlXG4gICAgICAgICAgICB9O1xuICAgICAgICB0aGlzLnNjcm9sbFdoZWVscy5wdXNoKHNjcm9sbFdoZWVsKTtcbiAgICAgICAgY29tcG9uZW50Lm9uKCdjbGljaycsIF9jbGlja0l0ZW0uYmluZCh0aGlzLCBzY3JvbGxXaGVlbCkpO1xuICAgICAgICBkYXRhU291cmNlLnB1c2goc2Nyb2xsQ29udHJvbGxlcik7XG4gICAgICAgIHNpemVSYXRpb3MucHVzaChjb21wb25lbnQuc2l6ZVJhdGlvKTtcbiAgICB9XG4gICAgdGhpcy5sYXlvdXQuc2V0RGF0YVNvdXJjZShkYXRhU291cmNlKTtcbiAgICB0aGlzLmxheW91dC5zZXRMYXlvdXRPcHRpb25zKHsgcmF0aW9zOiBzaXplUmF0aW9zIH0pO1xufVxuZnVuY3Rpb24gT3ZlcmxheUxheW91dChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGhlaWdodCA9IChjb250ZXh0LnNpemVbMV0gLSBvcHRpb25zLml0ZW1TaXplKSAvIDI7XG4gICAgY29udGV4dC5zZXQoJ3RvcCcsIHtcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgY29udGV4dC5zaXplWzBdLFxuICAgICAgICAgICAgaGVpZ2h0XG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxXG4gICAgICAgIF1cbiAgICB9KTtcbiAgICBjb250ZXh0LnNldCgnbWlkZGxlJywge1xuICAgICAgICBzaXplOiBbXG4gICAgICAgICAgICBjb250ZXh0LnNpemVbMF0sXG4gICAgICAgICAgICBjb250ZXh0LnNpemVbMV0gLSBoZWlnaHQgKiAyXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgIDFcbiAgICAgICAgXVxuICAgIH0pO1xuICAgIGNvbnRleHQuc2V0KCdib3R0b20nLCB7XG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIGNvbnRleHQuc2l6ZVswXSxcbiAgICAgICAgICAgIGhlaWdodFxuICAgICAgICBdLFxuICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBjb250ZXh0LnNpemVbMV0gLSBoZWlnaHQsXG4gICAgICAgICAgICAxXG4gICAgICAgIF1cbiAgICB9KTtcbn1cbmZ1bmN0aW9uIF9jcmVhdGVPdmVybGF5KCkge1xuICAgIHRoaXMub3ZlcmxheSA9IG5ldyBMYXlvdXRDb250cm9sbGVyKHtcbiAgICAgICAgbGF5b3V0OiBPdmVybGF5TGF5b3V0LFxuICAgICAgICBsYXlvdXRPcHRpb25zOiB7IGl0ZW1TaXplOiB0aGlzLm9wdGlvbnMud2hlZWxMYXlvdXQuaXRlbVNpemUgfSxcbiAgICAgICAgZGF0YVNvdXJjZTogdGhpcy5fb3ZlcmxheVJlbmRlcmFibGVzXG4gICAgfSk7XG4gICAgdGhpcy5hZGQodGhpcy5vdmVybGF5KTtcbn1cbm1vZHVsZS5leHBvcnRzID0gRGF0ZVBpY2tlcjsiLCJ2YXIgU3VyZmFjZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLlN1cmZhY2UgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5TdXJmYWNlIDogbnVsbDtcbnZhciBFdmVudEhhbmRsZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5FdmVudEhhbmRsZXIgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5FdmVudEhhbmRsZXIgOiBudWxsO1xuZnVuY3Rpb24gZGVjaW1hbDEoZGF0ZSkge1xuICAgIHJldHVybiAnJyArIGRhdGVbdGhpcy5nZXRdKCk7XG59XG5mdW5jdGlvbiBkZWNpbWFsMihkYXRlKSB7XG4gICAgcmV0dXJuICgnMCcgKyBkYXRlW3RoaXMuZ2V0XSgpKS5zbGljZSgtMik7XG59XG5mdW5jdGlvbiBkZWNpbWFsMyhkYXRlKSB7XG4gICAgcmV0dXJuICgnMDAnICsgZGF0ZVt0aGlzLmdldF0oKSkuc2xpY2UoLTMpO1xufVxuZnVuY3Rpb24gZGVjaW1hbDQoZGF0ZSkge1xuICAgIHJldHVybiAoJzAwMCcgKyBkYXRlW3RoaXMuZ2V0XSgpKS5zbGljZSgtNCk7XG59XG5mdW5jdGlvbiBCYXNlKG9wdGlvbnMpIHtcbiAgICB0aGlzLl9ldmVudE91dHB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbiAgICB0aGlzLl9wb29sID0gW107XG4gICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcywgdGhpcy5fZXZlbnRPdXRwdXQpO1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICB0aGlzW2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgICAgIH1cbiAgICB9XG59XG5CYXNlLnByb3RvdHlwZS5zdGVwID0gMTtcbkJhc2UucHJvdG90eXBlLmNsYXNzZXMgPSBbJ2l0ZW0nXTtcbkJhc2UucHJvdG90eXBlLmdldENvbXBvbmVudCA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGVbdGhpcy5nZXRdKCk7XG59O1xuQmFzZS5wcm90b3R5cGUuc2V0Q29tcG9uZW50ID0gZnVuY3Rpb24gKGRhdGUsIHZhbHVlKSB7XG4gICAgcmV0dXJuIGRhdGVbdGhpcy5zZXRdKHZhbHVlKTtcbn07XG5CYXNlLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgIHJldHVybiAnb3ZlcmlkZSB0byBpbXBsZW1lbnQnO1xufTtcbkJhc2UucHJvdG90eXBlLmNyZWF0ZU5leHQgPSBmdW5jdGlvbiAocmVuZGVyYWJsZSkge1xuICAgIHZhciBkYXRlID0gdGhpcy5nZXROZXh0KHJlbmRlcmFibGUuZGF0ZSk7XG4gICAgcmV0dXJuIGRhdGUgPyB0aGlzLmNyZWF0ZShkYXRlKSA6IHVuZGVmaW5lZDtcbn07XG5CYXNlLnByb3RvdHlwZS5nZXROZXh0ID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICBkYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkpO1xuICAgIHZhciBuZXdWYWwgPSB0aGlzLmdldENvbXBvbmVudChkYXRlKSArIHRoaXMuc3RlcDtcbiAgICBpZiAodGhpcy51cHBlckJvdW5kICE9PSB1bmRlZmluZWQgJiYgbmV3VmFsID49IHRoaXMudXBwZXJCb3VuZCkge1xuICAgICAgICBpZiAoIXRoaXMubG9vcCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBuZXdWYWwgPSBNYXRoLm1heChuZXdWYWwgJSB0aGlzLnVwcGVyQm91bmQsIHRoaXMubG93ZXJCb3VuZCB8fCAwKTtcbiAgICB9XG4gICAgdGhpcy5zZXRDb21wb25lbnQoZGF0ZSwgbmV3VmFsKTtcbiAgICByZXR1cm4gZGF0ZTtcbn07XG5CYXNlLnByb3RvdHlwZS5jcmVhdGVQcmV2aW91cyA9IGZ1bmN0aW9uIChyZW5kZXJhYmxlKSB7XG4gICAgdmFyIGRhdGUgPSB0aGlzLmdldFByZXZpb3VzKHJlbmRlcmFibGUuZGF0ZSk7XG4gICAgcmV0dXJuIGRhdGUgPyB0aGlzLmNyZWF0ZShkYXRlKSA6IHVuZGVmaW5lZDtcbn07XG5CYXNlLnByb3RvdHlwZS5nZXRQcmV2aW91cyA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpKTtcbiAgICB2YXIgbmV3VmFsID0gdGhpcy5nZXRDb21wb25lbnQoZGF0ZSkgLSB0aGlzLnN0ZXA7XG4gICAgaWYgKHRoaXMubG93ZXJCb3VuZCAhPT0gdW5kZWZpbmVkICYmIG5ld1ZhbCA8IHRoaXMubG93ZXJCb3VuZCkge1xuICAgICAgICBpZiAoIXRoaXMubG9vcCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBuZXdWYWwgPSBuZXdWYWwgJSB0aGlzLnVwcGVyQm91bmQ7XG4gICAgfVxuICAgIHRoaXMuc2V0Q29tcG9uZW50KGRhdGUsIG5ld1ZhbCk7XG4gICAgcmV0dXJuIGRhdGU7XG59O1xuQmFzZS5wcm90b3R5cGUuaW5zdGFsbENsaWNrSGFuZGxlciA9IGZ1bmN0aW9uIChyZW5kZXJhYmxlKSB7XG4gICAgcmVuZGVyYWJsZS5vbignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnY2xpY2snLCB7XG4gICAgICAgICAgICB0YXJnZXQ6IHJlbmRlcmFibGUsXG4gICAgICAgICAgICBldmVudDogZXZlbnRcbiAgICAgICAgfSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5CYXNlLnByb3RvdHlwZS5jcmVhdGVSZW5kZXJhYmxlID0gZnVuY3Rpb24gKGNsYXNzZXMsIGRhdGEpIHtcbiAgICByZXR1cm4gbmV3IFN1cmZhY2Uoe1xuICAgICAgICBjbGFzc2VzOiBjbGFzc2VzLFxuICAgICAgICBjb250ZW50OiAnPGRpdj4nICsgZGF0YSArICc8L2Rpdj4nXG4gICAgfSk7XG59O1xuQmFzZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICBkYXRlID0gZGF0ZSB8fCBuZXcgRGF0ZSgpO1xuICAgIHZhciByZW5kZXJhYmxlO1xuICAgIGlmICh0aGlzLl9wb29sLmxlbmd0aCkge1xuICAgICAgICByZW5kZXJhYmxlID0gdGhpcy5fcG9vbFswXTtcbiAgICAgICAgdGhpcy5fcG9vbC5zcGxpY2UoMCwgMSk7XG4gICAgICAgIHJlbmRlcmFibGUuc2V0Q29udGVudCh0aGlzLmZvcm1hdChkYXRlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyYWJsZSA9IHRoaXMuY3JlYXRlUmVuZGVyYWJsZSh0aGlzLmNsYXNzZXMsIHRoaXMuZm9ybWF0KGRhdGUpKTtcbiAgICAgICAgdGhpcy5pbnN0YWxsQ2xpY2tIYW5kbGVyKHJlbmRlcmFibGUpO1xuICAgIH1cbiAgICByZW5kZXJhYmxlLmRhdGUgPSBkYXRlO1xuICAgIHJldHVybiByZW5kZXJhYmxlO1xufTtcbkJhc2UucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAocmVuZGVyYWJsZSkge1xuICAgIHRoaXMuX3Bvb2wucHVzaChyZW5kZXJhYmxlKTtcbn07XG5mdW5jdGlvbiBZZWFyKCkge1xuICAgIEJhc2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblllYXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSk7XG5ZZWFyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFllYXI7XG5ZZWFyLnByb3RvdHlwZS5jbGFzc2VzID0gW1xuICAgICdpdGVtJyxcbiAgICAneWVhcidcbl07XG5ZZWFyLnByb3RvdHlwZS5mb3JtYXQgPSBkZWNpbWFsNDtcblllYXIucHJvdG90eXBlLnNpemVSYXRpbyA9IDE7XG5ZZWFyLnByb3RvdHlwZS5zdGVwID0gMTtcblllYXIucHJvdG90eXBlLmxvb3AgPSBmYWxzZTtcblllYXIucHJvdG90eXBlLnNldCA9ICdzZXRGdWxsWWVhcic7XG5ZZWFyLnByb3RvdHlwZS5nZXQgPSAnZ2V0RnVsbFllYXInO1xuZnVuY3Rpb24gTW9udGgoKSB7XG4gICAgQmFzZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuTW9udGgucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSk7XG5Nb250aC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNb250aDtcbk1vbnRoLnByb3RvdHlwZS5jbGFzc2VzID0gW1xuICAgICdpdGVtJyxcbiAgICAnbW9udGgnXG5dO1xuTW9udGgucHJvdG90eXBlLnNpemVSYXRpbyA9IDI7XG5Nb250aC5wcm90b3R5cGUubG93ZXJCb3VuZCA9IDA7XG5Nb250aC5wcm90b3R5cGUudXBwZXJCb3VuZCA9IDEyO1xuTW9udGgucHJvdG90eXBlLnN0ZXAgPSAxO1xuTW9udGgucHJvdG90eXBlLmxvb3AgPSB0cnVlO1xuTW9udGgucHJvdG90eXBlLnNldCA9ICdzZXRNb250aCc7XG5Nb250aC5wcm90b3R5cGUuZ2V0ID0gJ2dldE1vbnRoJztcbk1vbnRoLnByb3RvdHlwZS5zdHJpbmdzID0gW1xuICAgICdKYW51YXJ5JyxcbiAgICAnRmVicnVhcnknLFxuICAgICdNYXJjaCcsXG4gICAgJ0FwcmlsJyxcbiAgICAnTWF5JyxcbiAgICAnSnVuZScsXG4gICAgJ0p1bHknLFxuICAgICdBdWd1c3QnLFxuICAgICdTZXB0ZW1iZXInLFxuICAgICdPY3RvYmVyJyxcbiAgICAnTm92ZW1iZXInLFxuICAgICdEZWNlbWJlcidcbl07XG5Nb250aC5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICByZXR1cm4gdGhpcy5zdHJpbmdzW2RhdGUuZ2V0TW9udGgoKV07XG59O1xuZnVuY3Rpb24gRnVsbERheSgpIHtcbiAgICBCYXNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5GdWxsRGF5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZS5wcm90b3R5cGUpO1xuRnVsbERheS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBGdWxsRGF5O1xuRnVsbERheS5wcm90b3R5cGUuY2xhc3NlcyA9IFtcbiAgICAnaXRlbScsXG4gICAgJ2Z1bGxkYXknXG5dO1xuRnVsbERheS5wcm90b3R5cGUuc2l6ZVJhdGlvID0gMjtcbkZ1bGxEYXkucHJvdG90eXBlLnN0ZXAgPSAxO1xuRnVsbERheS5wcm90b3R5cGUuc2V0ID0gJ3NldERhdGUnO1xuRnVsbERheS5wcm90b3R5cGUuZ2V0ID0gJ2dldERhdGUnO1xuRnVsbERheS5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICByZXR1cm4gZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbn07XG5mdW5jdGlvbiBXZWVrRGF5KCkge1xuICAgIEJhc2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbldlZWtEYXkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSk7XG5XZWVrRGF5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdlZWtEYXk7XG5XZWVrRGF5LnByb3RvdHlwZS5jbGFzc2VzID0gW1xuICAgICdpdGVtJyxcbiAgICAnd2Vla2RheSdcbl07XG5XZWVrRGF5LnByb3RvdHlwZS5zaXplUmF0aW8gPSAyO1xuV2Vla0RheS5wcm90b3R5cGUubG93ZXJCb3VuZCA9IDA7XG5XZWVrRGF5LnByb3RvdHlwZS51cHBlckJvdW5kID0gNztcbldlZWtEYXkucHJvdG90eXBlLnN0ZXAgPSAxO1xuV2Vla0RheS5wcm90b3R5cGUubG9vcCA9IHRydWU7XG5XZWVrRGF5LnByb3RvdHlwZS5zZXQgPSAnc2V0RGF0ZSc7XG5XZWVrRGF5LnByb3RvdHlwZS5nZXQgPSAnZ2V0RGF0ZSc7XG5XZWVrRGF5LnByb3RvdHlwZS5zdHJpbmdzID0gW1xuICAgICdTdW5kYXknLFxuICAgICdNb25kYXknLFxuICAgICdUdWVzZGF5JyxcbiAgICAnV2VkbmVzZGF5JyxcbiAgICAnVGh1cnNkYXknLFxuICAgICdGcmlkYXknLFxuICAgICdTYXR1cmRheSdcbl07XG5XZWVrRGF5LnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgIHJldHVybiB0aGlzLnN0cmluZ3NbZGF0ZS5nZXREYXkoKV07XG59O1xuZnVuY3Rpb24gRGF5KCkge1xuICAgIEJhc2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbkRheS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2UucHJvdG90eXBlKTtcbkRheS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBEYXk7XG5EYXkucHJvdG90eXBlLmNsYXNzZXMgPSBbXG4gICAgJ2l0ZW0nLFxuICAgICdkYXknXG5dO1xuRGF5LnByb3RvdHlwZS5mb3JtYXQgPSBkZWNpbWFsMTtcbkRheS5wcm90b3R5cGUuc2l6ZVJhdGlvID0gMTtcbkRheS5wcm90b3R5cGUubG93ZXJCb3VuZCA9IDE7XG5EYXkucHJvdG90eXBlLnVwcGVyQm91bmQgPSAzMjtcbkRheS5wcm90b3R5cGUuc3RlcCA9IDE7XG5EYXkucHJvdG90eXBlLmxvb3AgPSB0cnVlO1xuRGF5LnByb3RvdHlwZS5zZXQgPSAnc2V0RGF0ZSc7XG5EYXkucHJvdG90eXBlLmdldCA9ICdnZXREYXRlJztcbmZ1bmN0aW9uIEhvdXIoKSB7XG4gICAgQmFzZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuSG91ci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2UucHJvdG90eXBlKTtcbkhvdXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSG91cjtcbkhvdXIucHJvdG90eXBlLmNsYXNzZXMgPSBbXG4gICAgJ2l0ZW0nLFxuICAgICdob3VyJ1xuXTtcbkhvdXIucHJvdG90eXBlLmZvcm1hdCA9IGRlY2ltYWwyO1xuSG91ci5wcm90b3R5cGUuc2l6ZVJhdGlvID0gMTtcbkhvdXIucHJvdG90eXBlLmxvd2VyQm91bmQgPSAwO1xuSG91ci5wcm90b3R5cGUudXBwZXJCb3VuZCA9IDI0O1xuSG91ci5wcm90b3R5cGUuc3RlcCA9IDE7XG5Ib3VyLnByb3RvdHlwZS5sb29wID0gdHJ1ZTtcbkhvdXIucHJvdG90eXBlLnNldCA9ICdzZXRIb3Vycyc7XG5Ib3VyLnByb3RvdHlwZS5nZXQgPSAnZ2V0SG91cnMnO1xuZnVuY3Rpb24gTWludXRlKCkge1xuICAgIEJhc2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbk1pbnV0ZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2UucHJvdG90eXBlKTtcbk1pbnV0ZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNaW51dGU7XG5NaW51dGUucHJvdG90eXBlLmNsYXNzZXMgPSBbXG4gICAgJ2l0ZW0nLFxuICAgICdtaW51dGUnXG5dO1xuTWludXRlLnByb3RvdHlwZS5mb3JtYXQgPSBkZWNpbWFsMjtcbk1pbnV0ZS5wcm90b3R5cGUuc2l6ZVJhdGlvID0gMTtcbk1pbnV0ZS5wcm90b3R5cGUubG93ZXJCb3VuZCA9IDA7XG5NaW51dGUucHJvdG90eXBlLnVwcGVyQm91bmQgPSA2MDtcbk1pbnV0ZS5wcm90b3R5cGUuc3RlcCA9IDE7XG5NaW51dGUucHJvdG90eXBlLmxvb3AgPSB0cnVlO1xuTWludXRlLnByb3RvdHlwZS5zZXQgPSAnc2V0TWludXRlcyc7XG5NaW51dGUucHJvdG90eXBlLmdldCA9ICdnZXRNaW51dGVzJztcbmZ1bmN0aW9uIFNlY29uZCgpIHtcbiAgICBCYXNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5TZWNvbmQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSk7XG5TZWNvbmQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2Vjb25kO1xuU2Vjb25kLnByb3RvdHlwZS5jbGFzc2VzID0gW1xuICAgICdpdGVtJyxcbiAgICAnc2Vjb25kJ1xuXTtcblNlY29uZC5wcm90b3R5cGUuZm9ybWF0ID0gZGVjaW1hbDI7XG5TZWNvbmQucHJvdG90eXBlLnNpemVSYXRpbyA9IDE7XG5TZWNvbmQucHJvdG90eXBlLmxvd2VyQm91bmQgPSAwO1xuU2Vjb25kLnByb3RvdHlwZS51cHBlckJvdW5kID0gNjA7XG5TZWNvbmQucHJvdG90eXBlLnN0ZXAgPSAxO1xuU2Vjb25kLnByb3RvdHlwZS5sb29wID0gdHJ1ZTtcblNlY29uZC5wcm90b3R5cGUuc2V0ID0gJ3NldFNlY29uZHMnO1xuU2Vjb25kLnByb3RvdHlwZS5nZXQgPSAnZ2V0U2Vjb25kcyc7XG5mdW5jdGlvbiBNaWxsaXNlY29uZCgpIHtcbiAgICBCYXNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5NaWxsaXNlY29uZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2UucHJvdG90eXBlKTtcbk1pbGxpc2Vjb25kLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1pbGxpc2Vjb25kO1xuTWlsbGlzZWNvbmQucHJvdG90eXBlLmNsYXNzZXMgPSBbXG4gICAgJ2l0ZW0nLFxuICAgICdtaWxsaXNlY29uZCdcbl07XG5NaWxsaXNlY29uZC5wcm90b3R5cGUuZm9ybWF0ID0gZGVjaW1hbDM7XG5NaWxsaXNlY29uZC5wcm90b3R5cGUuc2l6ZVJhdGlvID0gMTtcbk1pbGxpc2Vjb25kLnByb3RvdHlwZS5sb3dlckJvdW5kID0gMDtcbk1pbGxpc2Vjb25kLnByb3RvdHlwZS51cHBlckJvdW5kID0gMTAwMDtcbk1pbGxpc2Vjb25kLnByb3RvdHlwZS5zdGVwID0gMTtcbk1pbGxpc2Vjb25kLnByb3RvdHlwZS5sb29wID0gdHJ1ZTtcbk1pbGxpc2Vjb25kLnByb3RvdHlwZS5zZXQgPSAnc2V0TWlsbGlzZWNvbmRzJztcbk1pbGxpc2Vjb25kLnByb3RvdHlwZS5nZXQgPSAnZ2V0TWlsbGlzZWNvbmRzJztcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIEJhc2U6IEJhc2UsXG4gICAgWWVhcjogWWVhcixcbiAgICBNb250aDogTW9udGgsXG4gICAgRnVsbERheTogRnVsbERheSxcbiAgICBXZWVrRGF5OiBXZWVrRGF5LFxuICAgIERheTogRGF5LFxuICAgIEhvdXI6IEhvdXIsXG4gICAgTWludXRlOiBNaW51dGUsXG4gICAgU2Vjb25kOiBTZWNvbmQsXG4gICAgTWlsbGlzZWNvbmQ6IE1pbGxpc2Vjb25kXG59OyIsInZhciBTdXJmYWNlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuU3VyZmFjZSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLlN1cmZhY2UgOiBudWxsO1xudmFyIFZpZXcgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5WaWV3IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuVmlldyA6IG51bGw7XG52YXIgTGF5b3V0Q29udHJvbGxlciA9IHJlcXVpcmUoJy4uL0xheW91dENvbnRyb2xsZXInKTtcbnZhciBUYWJCYXJMYXlvdXQgPSByZXF1aXJlKCcuLi9sYXlvdXRzL1RhYkJhckxheW91dCcpO1xuZnVuY3Rpb24gVGFiQmFyKG9wdGlvbnMpIHtcbiAgICBWaWV3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5fc2VsZWN0ZWRJdGVtSW5kZXggPSAtMTtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLmNsYXNzZXMgPSBvcHRpb25zLmNsYXNzZXMgPyB0aGlzLmNsYXNzZXMuY29uY2F0KG9wdGlvbnMuY2xhc3NlcykgOiB0aGlzLmNsYXNzZXM7XG4gICAgdGhpcy5sYXlvdXQgPSBuZXcgTGF5b3V0Q29udHJvbGxlcih0aGlzLm9wdGlvbnMubGF5b3V0Q29udHJvbGxlcik7XG4gICAgdGhpcy5hZGQodGhpcy5sYXlvdXQpO1xuICAgIHRoaXMubGF5b3V0LnBpcGUodGhpcy5fZXZlbnRPdXRwdXQpO1xuICAgIHRoaXMuX3JlbmRlcmFibGVzID0ge1xuICAgICAgICBpdGVtczogW10sXG4gICAgICAgIHNwYWNlcnM6IFtdLFxuICAgICAgICBiYWNrZ3JvdW5kOiB0aGlzLm9wdGlvbnMucmVuZGVyYWJsZXMuYmFja2dyb3VuZCA/IF9jcmVhdGVSZW5kZXJhYmxlLmNhbGwodGhpcywgJ2JhY2tncm91bmQnKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgc2VsZWN0ZWRJdGVtT3ZlcmxheTogdGhpcy5vcHRpb25zLnJlbmRlcmFibGVzLnNlbGVjdGVkSXRlbU92ZXJsYXkgPyBfY3JlYXRlUmVuZGVyYWJsZS5jYWxsKHRoaXMsICdzZWxlY3RlZEl0ZW1PdmVybGF5JykgOiB1bmRlZmluZWRcbiAgICB9O1xuICAgIHRoaXMuc2V0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xufVxuVGFiQmFyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmlldy5wcm90b3R5cGUpO1xuVGFiQmFyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRhYkJhcjtcblRhYkJhci5wcm90b3R5cGUuY2xhc3NlcyA9IFtcbiAgICAnZmYtd2lkZ2V0JyxcbiAgICAnZmYtdGFiYmFyJ1xuXTtcblRhYkJhci5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgdGFiQmFyTGF5b3V0OiB7XG4gICAgICAgIG1hcmdpbnM6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgc3BhY2luZzogMFxuICAgIH0sXG4gICAgcmVuZGVyYWJsZXM6IHtcbiAgICAgICAgYmFja2dyb3VuZDogZmFsc2UsXG4gICAgICAgIHNlbGVjdGVkSXRlbU92ZXJsYXk6IGZhbHNlLFxuICAgICAgICBzcGFjZXI6IGZhbHNlXG4gICAgfSxcbiAgICBsYXlvdXRDb250cm9sbGVyOiB7XG4gICAgICAgIGF1dG9QaXBlRXZlbnRzOiB0cnVlLFxuICAgICAgICBsYXlvdXQ6IFRhYkJhckxheW91dCxcbiAgICAgICAgZmxvdzogdHJ1ZSxcbiAgICAgICAgcmVmbG93T25SZXNpemU6IGZhbHNlLFxuICAgICAgICBub2RlU3ByaW5nOiB7XG4gICAgICAgICAgICBkYW1waW5nUmF0aW86IDAuOCxcbiAgICAgICAgICAgIHBlcmlvZDogMzAwXG4gICAgICAgIH1cbiAgICB9XG59O1xuZnVuY3Rpb24gX3NldFNlbGVjdGVkSXRlbShpbmRleCkge1xuICAgIGlmIChpbmRleCAhPT0gdGhpcy5fc2VsZWN0ZWRJdGVtSW5kZXgpIHtcbiAgICAgICAgdmFyIG9sZEluZGV4ID0gdGhpcy5fc2VsZWN0ZWRJdGVtSW5kZXg7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkSXRlbUluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMubGF5b3V0LnNldExheW91dE9wdGlvbnMoeyBzZWxlY3RlZEl0ZW1JbmRleDogaW5kZXggfSk7XG4gICAgICAgIGlmIChvbGRJbmRleCA+PSAwICYmIHRoaXMuX3JlbmRlcmFibGVzLml0ZW1zW29sZEluZGV4XS5yZW1vdmVDbGFzcykge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyYWJsZXMuaXRlbXNbb2xkSW5kZXhdLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9yZW5kZXJhYmxlcy5pdGVtc1tpbmRleF0uYWRkQ2xhc3MpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmFibGVzLml0ZW1zW2luZGV4XS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2xkSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgndGFiY2hhbmdlJywge1xuICAgICAgICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICAgICAgb2xkSW5kZXg6IG9sZEluZGV4LFxuICAgICAgICAgICAgICAgIGl0ZW06IHRoaXMuX3JlbmRlcmFibGVzLml0ZW1zW2luZGV4XVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBfY3JlYXRlUmVuZGVyYWJsZShpZCwgZGF0YSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuY3JlYXRlUmVuZGVyYWJsZSkge1xuICAgICAgICB2YXIgcmVuZGVyYWJsZSA9IHRoaXMub3B0aW9ucy5jcmVhdGVSZW5kZXJhYmxlLmNhbGwodGhpcywgaWQsIGRhdGEpO1xuICAgICAgICBpZiAocmVuZGVyYWJsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbmRlcmFibGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCAmJiBkYXRhIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICB2YXIgc3VyZmFjZSA9IG5ldyBTdXJmYWNlKHtcbiAgICAgICAgICAgIGNsYXNzZXM6IHRoaXMuY2xhc3NlcyxcbiAgICAgICAgICAgIGNvbnRlbnQ6IGRhdGEgPyAnPGRpdj4nICsgZGF0YSArICc8L2Rpdj4nIDogdW5kZWZpbmVkXG4gICAgICAgIH0pO1xuICAgIHN1cmZhY2UuYWRkQ2xhc3MoaWQpO1xuICAgIGlmIChpZCA9PT0gJ2l0ZW0nKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudGFiQmFyTGF5b3V0ICYmIHRoaXMub3B0aW9ucy50YWJCYXJMYXlvdXQuaXRlbVNpemUgJiYgdGhpcy5vcHRpb25zLnRhYkJhckxheW91dC5pdGVtU2l6ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgc3VyZmFjZS5zZXRTaXplKHRoaXMubGF5b3V0LmdldERpcmVjdGlvbigpID8gW1xuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3VyZmFjZTtcbn1cblRhYkJhci5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgVmlldy5wcm90b3R5cGUuc2V0T3B0aW9ucy5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIGlmICghdGhpcy5sYXlvdXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLnRhYkJhckxheW91dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMubGF5b3V0LnNldExheW91dE9wdGlvbnMob3B0aW9ucy50YWJCYXJMYXlvdXQpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5sYXlvdXRDb250cm9sbGVyKSB7XG4gICAgICAgIHRoaXMubGF5b3V0LnNldE9wdGlvbnMob3B0aW9ucy5sYXlvdXRDb250cm9sbGVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuVGFiQmFyLnByb3RvdHlwZS5zZXRJdGVtcyA9IGZ1bmN0aW9uIChpdGVtcykge1xuICAgIHZhciBjdXJyZW50SW5kZXggPSB0aGlzLl9zZWxlY3RlZEl0ZW1JbmRleDtcbiAgICB0aGlzLl9zZWxlY3RlZEl0ZW1JbmRleCA9IC0xO1xuICAgIHRoaXMuX3JlbmRlcmFibGVzLml0ZW1zID0gW107XG4gICAgdGhpcy5fcmVuZGVyYWJsZXMuc3BhY2VycyA9IFtdO1xuICAgIGlmIChpdGVtcykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IF9jcmVhdGVSZW5kZXJhYmxlLmNhbGwodGhpcywgJ2l0ZW0nLCBpdGVtc1tpXSk7XG4gICAgICAgICAgICBpZiAoaXRlbS5vbikge1xuICAgICAgICAgICAgICAgIGl0ZW0ub24oJ2NsaWNrJywgX3NldFNlbGVjdGVkSXRlbS5iaW5kKHRoaXMsIGkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmFibGVzLml0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJlbmRlcmFibGVzLnNwYWNlciAmJiBpIDwgaXRlbXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIHZhciBzcGFjZXIgPSBfY3JlYXRlUmVuZGVyYWJsZS5jYWxsKHRoaXMsICdzcGFjZXInLCAnICcpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlbmRlcmFibGVzLnNwYWNlcnMucHVzaChzcGFjZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMubGF5b3V0LnNldERhdGFTb3VyY2UodGhpcy5fcmVuZGVyYWJsZXMpO1xuICAgIGlmICh0aGlzLl9yZW5kZXJhYmxlcy5pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgX3NldFNlbGVjdGVkSXRlbS5jYWxsKHRoaXMsIE1hdGgubWF4KE1hdGgubWluKGN1cnJlbnRJbmRleCwgdGhpcy5fcmVuZGVyYWJsZXMuaXRlbXMubGVuZ3RoIC0gMSksIDApKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuVGFiQmFyLnByb3RvdHlwZS5nZXRJdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVuZGVyYWJsZXMuaXRlbXM7XG59O1xuVGFiQmFyLnByb3RvdHlwZS5nZXRJdGVtU3BlYyA9IGZ1bmN0aW9uIChpbmRleCwgbm9ybWFsaXplKSB7XG4gICAgcmV0dXJuIHRoaXMubGF5b3V0LmdldFNwZWModGhpcy5fcmVuZGVyYWJsZXMuaXRlbXNbaW5kZXhdLCBub3JtYWxpemUpO1xufTtcblRhYkJhci5wcm90b3R5cGUuc2V0U2VsZWN0ZWRJdGVtSW5kZXggPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICBfc2V0U2VsZWN0ZWRJdGVtLmNhbGwodGhpcywgaW5kZXgpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblRhYkJhci5wcm90b3R5cGUuZ2V0U2VsZWN0ZWRJdGVtSW5kZXggPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkSXRlbUluZGV4O1xufTtcblRhYkJhci5wcm90b3R5cGUuZ2V0U2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnNpemUgfHwgKHRoaXMubGF5b3V0ID8gdGhpcy5sYXlvdXQuZ2V0U2l6ZSgpIDogVmlldy5wcm90b3R5cGUuZ2V0U2l6ZS5jYWxsKHRoaXMpKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFRhYkJhcjsiXX0=
