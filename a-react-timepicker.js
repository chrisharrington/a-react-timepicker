"use strict";

(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined")
        module.exports = factory();
    if (typeof define === "function" && define.amd)
        define(factory);
    global.AReactTimepicker = factory();
}(this, function () {
	var React = typeof require === "function" ? require("react") : window.React;

	var CLOCK_SIZE = 182;

	module.exports = React.createClass({
		getInitialState: function() {
			return {
				visible: false,
				hour: 12,
				minute: 0,
				am: true,
				position: {
					top: 0,
					left: 0
				}
			};
		},

		componentWillMount: function() {
			document.addEventListener("click", this.hideOnDocumentClick);
		},

		componentWillUnmount: function() {
			document.removeEventListener("click", this.hideOnDocumentClick);
		},

		show: function() {
			var trigger = this.refs.trigger.getDOMNode(),
				rect = trigger.getBoundingClientRect(),
				isTopHalf = rect.top > window.innerHeight/2;

			this.setState({
				visible: true,
				position: {
					top: isTopHalf ? (rect.top + window.scrollY - CLOCK_SIZE - 3) : (rect.top + trigger.clientHeight + window.scrollY + 3),
					left: rect.left
				}
			});
		},

		hide: function() {
			this.setState({
				visible: false
			});
		},

		hideOnDocumentClick: function(e) {
			if (!this.parentsHaveClassName(e.target, "time-picker"))
				this.hide();
		},

		parentsHaveClassName: function(element, className) {
			var parent = element;
			while (parent) {
				if (parent.className && parent.className.indexOf(className) > -1)
					return true;

				parent = parent.parentNode;
			}

			return false;
		},

		onTimeChanged: function(hour, minute, am) {
			this.setState({
				hour: hour,
				minute: minute,
				am: am
			});
		},

		onDone: function() {
			this.hide();
		},

		formatTime: function() {
			return this.state.hour.toString().pad(2) + ":" + this.state.minute.toString().pad(2) + " " + (this.state.am ? "AM" : "PM");
		},

		render: function() {
			return <div className="time-picker">
				<input ref="trigger" type="text" disabled value={this.formatTime()} onClick={this.show} />
				<Clock visible={this.state.visible} position={this.state.position} onTimeChanged={this.onTimeChanged} onDone={this.onDone} hour={this.state.hour} minute={this.state.minute} am={this.state.am} />
			</div>;
		}
	});

	var Clock = React.createClass({
	    getInitialState: function() {
	        return {
	            hoursVisible: true,
	            minutesVisible: false,
	            amPmVisible: false,
				position: "below"
	        };
	    },

		componentWillReceiveProps: function(props) {
			if (this.props.visible && !props.visible)
				this.setState({
					hoursVisible: true,
					minutesVisible: false,
					amPmVisible: false
				});
		},

		getTime: function() {
			return {
				hour: this.props.hour,
				minute: this.props.minute,
				am: this.props.am
			};
		},

		onHourChanged: function(hour) {
			this.props.onTimeChanged(hour, this.props.minute, this.props.am);

			this.setState({
				hoursVisible: false,
				minutesVisible: true
			});
		},

		onMinuteChanged: function(minute) {
			this.props.onTimeChanged(this.props.hour, minute, this.props.am);

			this.setState({
				minutesVisible: false,
				amPmVisible: true
			});
		},

		onAmPmChanged: function(am) {
			this.props.onDone();
			this.props.onTimeChanged(this.props.hour, this.props.minute, am);

			this.setState({
				am: am,
				amPmVisible: false,
				hoursVisible: true
			});
		},

		style: function() {
			return {
				top: this.props.position.top,
				left: this.props.position.left
			};
		},

		render: function() {
			return <div className={"clock " + (this.props.visible ? "clock-show" : "clock-hide")} style={this.style()}>
				<div className="time hidden">
					<span className="hour">{this.props.hour.toString().pad(2)}</span>
					<span>:</span>
					<span className="minute">{this.props.minute.toString().pad(2)}</span>
					<span> </span>
					<span className="am-pm">{this.props.am ? "AM" : "PM"}</span>
				</div>
				<div className="clock-face-wrapper">
		            <Hours visible={this.state.hoursVisible} time={this.getTime()} onClick={this.onHourChanged} />
					<Minutes visible={this.state.minutesVisible} time={this.getTime()} onClick={this.onMinuteChanged} />
					<AmPm visible={this.state.amPmVisible} time={this.getTime()} onClick={this.onAmPmChanged} />
				</div>
			</div>;
		}
	});

	var Hours = React.createClass({
	    buildHours: function() {
	        var hours = [];
	        for (var i = 1; i <= 12; i++)
	            hours.push(i);
	        return hours;
	    },

		render: function() {
			return <Face visible={this.props.visible} type="hours" values={this.buildHours()} prompt="Hour" time={this.props.time} onClick={this.props.onClick} selected={this.props.time.hour} />;
		}
	});

	var Minutes = React.createClass({
	    buildMinutes: function() {
	        var minutes = [];
	        for (var i = 1; i <= 12; i++)
	            minutes.push(((i === 12 ? 0 : i)*5).toString().pad(2));
	        return minutes;
	    },

		render: function() {
			return <Face visible={this.props.visible} type="minutes" values={this.buildMinutes()} prompt="Minute" time={this.props.time} onClick={this.props.onClick} selected={this.props.time.minute} />;
		}
	});

	var AmPm = React.createClass({
		render: function() {
			return <div className={"face am-pm" + (this.props.visible ? " face-show" : " face-hide")}>
	            <div className="centre">
					<div className="prompt">AM/PM?</div>
	                <div className="am-pm">
	                    <span className={this.props.time.am ? "selected" : ""} onClick={this.props.onClick.bind(null, true)}>AM</span>
						<span className={!this.props.time.am ? "selected" : ""} onClick={this.props.onClick.bind(null, false)}>PM</span>
	                </div>
				</div>
	        </div>;
		}
	});


	var Face = React.createClass({
		pad: function(value) {
			value = value.toString();
			return value.length === 1 ? ("0" + value) : value;
		},

	    render: function() {
			return <div className={"face " + this.props.type + (this.props.visible ? " face-show" : " face-hide")}>
	            {this.props.values.map(function(value, i) {
	                return <div key={i} className={"position position-" + (i+1) + (parseInt(this.props.selected) === parseInt(value) ? " selected" : "")} onClick={this.props.onClick.bind(null, value)}>{this.pad(value)}</div>;
	            }.bind(this))}
				<div className="centre">
					<div className="prompt">{this.props.prompt}</div>
				</div>
			</div>;
		}
	});
});
