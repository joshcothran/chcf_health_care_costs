// Data
/*
var spending;
var services_elements;
var payers_elements;
var years;
var services_legend;
var payers_legend;
*/

// Constants
var TIMER_DURATION = 700;
var TRANSITION_DURATION = 350;

var LIGHTBOX_WIDTH = 960;
var LIGHTBOX_HEIGHT = 571;
var HEADER_HEIGHT = 44;
var CONTROLS_HEIGHT = 35;
var FOOTER_HEIGHT = 26;
var CELL_BORDER_TB = 2;
var CELL_BORDER_LR = 1;
var CHART_WIDTH = LIGHTBOX_WIDTH - (CELL_BORDER_LR * 2);
var CHART_HEIGHT = LIGHTBOX_HEIGHT - HEADER_HEIGHT - CONTROLS_HEIGHT - FOOTER_HEIGHT - (CELL_BORDER_TB * 2);
var SLIDER_PADDING_L = 20;
var SLIDER_PADDING_R = 12;
var SLIDER_PADDING_T = 3;

var ROW_LABEL_WIDTH = 300;
var ROW_LABEL_PADDING_RT = 10;
var TT_PADDING = 10;
var TT_INDENT = 10;
var TT_HEIGHT = 207;
var TT_BORDER_WIDTH = 1;	
var TT_ARROW_HEIGHT = 9;
var TT_FOOTER_OFFSET = 5;

// JQuery handles
var jq_btn_play_year_i;
var jq_year_label;
var jq_tooltip;
var jq_tooltip_arrow;
var jq_caption_year;
var jq_caption_spending;
var jq_year_select;

// Visualization
var treemap;

function formatSpending(val) {return (val / 1000).toFixed(1); }
var formatPercent = d3.format("%");

// State variables
var current_year_index;

// Playback control
var year_playing = false;
var year_timer = null;
var init_play_timer = null;

function initGlobal() {
	// Init JQuery handles
	jq_btn_play_year_i = $("#btn_play_year i");
	jq_year_label = $("#year_label");
	jq_tooltip = $("#tooltip");
	jq_tooltip_arrow = $("#tooltip_arrow");
	jq_caption_year = $("#caption_year");
	jq_caption_spending = $("#caption_spending");
	jq_year_select = $("#year_select");
	
	// years
	// category_legend
	// payer_legend
	// category_totals
	// payer_totals
	
	// Init layout
	initLayout();
	
	// Init year
	current_year_index = 0;
	buildYearSelect();
	
	jq_year_select.val(current_year_index);
	jq_year_label.html(years[current_year_index]);
	jq_caption_year.html(years[current_year_index]);
	jq_caption_spending.html(formatSpending(getTotalSpending()));
	
	// Init event handlers
	initEventHandlers();
	
	// Init tooltip
	initTooltip();
	
	// Init/render treemap
	treemap = new TreemapVisualization("chart");
	treemap.render();
	
	current_year_index = years.length - 1;
	playYear();
}

function getTotalSpending() {
	var totalSpending = 0;
	_.each(category_totals, function(c) {
		totalSpending += c[current_year_index];
	});
	return totalSpending;
}

function getCategorySpending(category) {
	return category_totals[category][current_year_index];
}

function getPayerSpending(category, payer) {
	return payer_totals[category][payer][current_year_index];
}

function initEventHandlers() {	
	jq_year_select.change(function() {
		if (!year_playing) {
			current_year_index = parseInt(this.value);
			jq_year_label.html(years[current_year_index]);
			jq_caption_year.html(years[current_year_index]);
			jq_caption_spending.html(formatSpending(getTotalSpending()));
			jq_year_select.val(current_year_index);
			treemap.update();
		}
	});
	
	$("#btn_play_year").click(function() {
		$("#btn_play_year i").toggleClass('icon-play');
		$("#btn_play_year i").toggleClass('icon-stop');	
		if (!year_playing) {
			playYear();
		} else {
			stopYear();
		}
	});
	
	$("#tt_link_notes")
		.mouseenter(function() { $("#tt_notes").toggleClass("tt_visible"); })
		.mouseleave(function() { $("#tt_notes").toggleClass("tt_visible"); });
	
	$("#btn_prev_year").click(function() { stopYear(); decrementYear(); });
	$("#btn_next_year").click(function() { stopYear(); incrementYear(); });
}

function playYear() {
	if (jq_btn_play_year_i.hasClass('icon-play')) jq_btn_play_year_i.removeClass('icon-play');
	if (!jq_btn_play_year_i.hasClass('icon-stop')) jq_btn_play_year_i.addClass('icon-stop');	
	
	hideTooltips();
	
	year_playing = true;
	year_timer = setInterval(function() {
		incrementYear();
	}, TIMER_DURATION);

	if(current_year_index + 1 < years.length) current_year_index++;
	else current_year_index = 0;
	updateCurrentYear();
}

function stopYear() {
	if (jq_btn_play_year_i.hasClass('icon-stop')) jq_btn_play_year_i.removeClass('icon-stop');
	if (!jq_btn_play_year_i.hasClass('icon-play')) jq_btn_play_year_i.addClass('icon-play');	
	
	year_playing = false;
	clearInterval(year_timer);
}

function incrementYear() {
	if(current_year_index + 1 < years.length) {	 
		current_year_index++;
		updateCurrentYear();
	}
	else {
		if (year_playing) stopYear();
		else {
			current_year_index = 0;
			updateCurrentYear();
		}
	}
}

function decrementYear() {
	if(current_year_index > 0) current_year_index--;
	else current_year_index = years.length - 1;
	updateCurrentYear();
}

function updateCurrentYear() {
	jq_year_label.html(years[current_year_index]);
	jq_caption_year.html(years[current_year_index]);
	jq_caption_spending.html(formatSpending(getTotalSpending()));
	jq_year_select.val(current_year_index);
	jq_year_select.trigger("change");
	treemap.update();
	
	if (year_playing && current_year_index + 1 == years.length) {
		if (jq_btn_play_year_i.hasClass('icon-stop')) jq_btn_play_year_i.removeClass('icon-stop');
		if (!jq_btn_play_year_i.hasClass('icon-play')) jq_btn_play_year_i.addClass('icon-play');		
	}
}

function hideTooltips() {
	jq_tooltip.css("display", "none");
	jq_tooltip_arrow.css("display", "none");	
}

var initTooltip = function() {
	jq_tooltip.css("width", ROW_LABEL_WIDTH - (TT_PADDING * 2) - TT_INDENT + "px");
	jq_tooltip.css("height", TT_HEIGHT - (TT_PADDING * 2) + "px");
	jq_tooltip.css("padding", TT_PADDING + "px");
	jq_tooltip.css("border-width", TT_BORDER_WIDTH + "px");
	
	jq_tooltip_arrow.css("left", ROW_LABEL_WIDTH - TT_INDENT + (TT_BORDER_WIDTH * 2) + "px");
	
	_.each(payer_legend, function(payer_name, payer_id) {
		var tt_label = "";
		tt_label += "<div id='" + payer_id + "_tt' class='tt_row'>";
		tt_label += 	"<div class='" + payer_id + " tt_legend'>&nbsp;</div>";
		tt_label += 	"<div class='tt_legend_desc'>&nbsp;" + payer_name + "</div>";
		tt_label += 	"<div class='tt_spending' id='tt_spending_" + payer_id + "'>&nbsp;</div>";
		tt_label += "</div>";
		jq_tooltip.append(tt_label);
	});
};

function buildYearSelect() {	
	// var year_select_values = _.clone(years).reverse();
	_.each(years, function(year) {
		jq_year_select.append("<option value='" + years.indexOf(year) + "'>" + year + "</option>");
	});
	
	jq_year_select.selectToUISlider({
		labels: 5,
		labelSrc: "text",
		tooltip: false
	});
	
	$(".ui-slider").bind( "slidestop", function(event, ui) {
		stopYear();
		jq_year_select.trigger("change");
	});
}

function initLayout() {
	var jq_content = $("#content");
	jq_content.css("width", LIGHTBOX_WIDTH + "px");
	jq_content.css("height", LIGHTBOX_HEIGHT + "px");
	
	var jq_header = $("#header");
	jq_header.css("width", LIGHTBOX_WIDTH + "px");
	jq_header.css("height", HEADER_HEIGHT + "px");
	jq_header.css("line-height", HEADER_HEIGHT + "px");
	
	var jq_controls = $("#controls");
	jq_controls.css("width", LIGHTBOX_WIDTH + "px");
	jq_controls.css("top", HEADER_HEIGHT + "px");
	jq_controls.css("height", CONTROLS_HEIGHT + "px");
	jq_controls.css("line-height", CONTROLS_HEIGHT + "px");
	jq_controls.css("padding_left", ROW_LABEL_WIDTH + "px");
	
	var jq_chart = $("#chart");
	jq_chart.css("top", HEADER_HEIGHT + CONTROLS_HEIGHT + "px");
	jq_chart.css("width", LIGHTBOX_WIDTH + "px");
	jq_chart.css("height", CHART_HEIGHT + "px");
	
	var jq_footer = $("#footer");
	jq_footer.css("width", LIGHTBOX_WIDTH + "px");
	jq_footer.css("height", FOOTER_HEIGHT + "px");
	jq_footer.css("line-height", FOOTER_HEIGHT + "px");
	jq_footer.css("top", LIGHTBOX_HEIGHT - FOOTER_HEIGHT + "px");
	
	var jq_footer_tooltip = $(".footer_tooltip");
	jq_footer_tooltip.css("padding", TT_PADDING + "px");
	jq_footer_tooltip.css("bottom", 0 - (CELL_BORDER_TB * 2) + "px");
	jq_footer_tooltip.css("width", ROW_LABEL_WIDTH - (TT_PADDING * 2) - TT_INDENT + "px");
	jq_footer_tooltip.css("height", CHART_HEIGHT - (TT_PADDING * 2) + "px");

	
	var jq_footnotes_link = $("#footnotes_link");
	jq_footnotes_link.css("left", "0px");
	jq_footnotes_link.css("width", ROW_LABEL_WIDTH - ROW_LABEL_PADDING_RT + "px");
	jq_footnotes_link.css("padding-right", ROW_LABEL_PADDING_RT + "px");
	jq_footnotes_link.css("height", FOOTER_HEIGHT + "px");
	jq_footnotes_link.css("line-height", FOOTER_HEIGHT + "px");
	
	var jq_footer_legend = $("#footer_legend");
	jq_footer_legend.css("left", ROW_LABEL_WIDTH + CELL_BORDER_LR + "px");
	jq_footer_legend.css("width", CHART_WIDTH - ROW_LABEL_WIDTH - CELL_BORDER_LR + "px");
	jq_footer_legend.css("height", FOOTER_HEIGHT + "px");
	jq_footer_legend.css("line-height", FOOTER_HEIGHT + "px");
	
	payer_ids = _.map(payer_legend, function(payer_name, payer_id){ return payer_id; });
	_.each(payer_ids, function(payer_id, payer_index) {
		var footer_label = "";
		footer_label += 	"<div class='" + payer_id + " footer_legend'>&nbsp;</div>";
		footer_label += 	"<div class='footer_legend_desc";
		if (payer_index == payer_ids.length - 1) footer_label += " last";
		footer_label += 	"'>" + payer_legend[payer_id] + "</div>";
		jq_footer_legend.append(footer_label);
	});
	
	$(".footer_legend").css("top", (FOOTER_HEIGHT - $(".footer_legend").height()) / 2 + "px");
	$(".footer_legend_desc").css("line-height", FOOTER_HEIGHT + "px");
	
	// Show the content once it's (mostly) been laid out
	$("#content").css("display", "block");
	
	var jq_year_buttons = $("#year_buttons");
	jq_year_buttons.css("left", ROW_LABEL_WIDTH + "px");
	
	var jq_year_slider = $("#year_slider");
	jq_year_slider.css("width", LIGHTBOX_WIDTH - ROW_LABEL_WIDTH - jq_year_buttons.width() - SLIDER_PADDING_L - SLIDER_PADDING_R + "px");
	jq_year_slider.css("right", SLIDER_PADDING_R + "px");
	jq_year_slider.css("top", SLIDER_PADDING_T + "px");
}