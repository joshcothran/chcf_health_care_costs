function TreemapVisualization() {
	var tt_category_title = $("#tt_category_title");
	var chart = d3.select("#chart");
	var rows;
	var row_labels = new Object();
	var cols = new Object();
	
	var dimension_test = $("#dimension_test");
	var row_label_height;
	var payer_label_height;
	var payer_label_widths = new Object();
	var category_ids = [];
	var payer_ids = [];

	this.render = function() {		
		// Measure text dimensions
		row_label_height = getTextHeight("Test", "row_label_text");
		payer_label_height = getTextHeight("Test", "payer_cell_text");
		_.each(payer_legend, function(payer_name, payer_id) {
			payer_label_widths[payer_id] = getTextWidth(payer_name, "payer_cell_text");
		});
		
		jq_year_label.css("width", CHART_WIDTH - ROW_LABEL_WIDTH + "px");
		jq_year_label.css("height", CHART_HEIGHT + "px");
		jq_year_label.css("left", ROW_LABEL_WIDTH + CELL_BORDER_LR + "px");
		jq_year_label.css("top", CELL_BORDER_TB + "px");
		jq_year_label.css("line-height", CHART_HEIGHT + "px");
		
		// Init rows
		var row_spending_tally = 0;
		category_ids = _.map(category_legend, function(category_name, category_id){ return category_id; });
		payer_ids = _.map(payer_legend, function(payer_name, payer_id){ return payer_id; });
		
		rows = chart.selectAll("div.tree_row")
				.data(category_ids)
			.enter().append("div")
				.attr("id", function(d) {
					return d;
				})
				.classed("tree_row", true)
				.style("top", function(d) {
					t = rowTop(row_spending_tally);
					row_spending_tally += getCategorySpending(d);
					var h = rowHeight(d);
					if (h < 4) return (t - 4) + "px";
					else return t + "px";
				})
				.style("height", function(d) {
					var h = rowHeight(d);
					if (h < 4) return "4px";
					else return h + "px";	
				});
				
		// Init rows
		var row_rollovers_spending_tally = 0;
		row_rollovers = chart.selectAll("div.tree_row_rollover")
				.data(category_ids)
			.enter().append("div")
				.attr("id", function(d) {return d + "_rollover";})
				.classed("tree_row_rollover", true)
				.style("width", CHART_WIDTH - ROW_LABEL_WIDTH + "px")
				.style("left", ROW_LABEL_WIDTH + "px")
				.style("border-width", "0px " + CELL_BORDER_LR + "px " + CELL_BORDER_TB + "px " + CELL_BORDER_LR + "px")
				.attr("category", function(d) {return d;})
				.style("top", function(d) {
					t = rowTop(row_rollovers_spending_tally);
					row_rollovers_spending_tally += getCategorySpending(d);
					var h = rowHeight(d);
					if (h < 4) return (t - 4) + "px";
					else return t + "px";
				})
				.style("height", function(d) {
					var h = rowHeight(d);
					if (h < 4) return "4px";
					else return h + "px";	
				});
								
		// Init columns
		_.each(category_ids, function(category_id) {			
			var row = d3.select("#" + category_id);
			var col_spending_tally = 0;

			// Row Labels
			row_labels[category_id] = row.append("div")
					.classed("row_label", true)
					.style("width", ROW_LABEL_WIDTH - ROW_LABEL_PADDING_RT + "px")
					.style("padding-right", ROW_LABEL_PADDING_RT + "px")
					.html(function() {
						// if (row_label_height < rowHeight(category_id)) {
							var spendingAmountLabel = getCategorySpendingAmountLabel(category_id, true);
							return category_legend[category_id] + spendingAmountLabel;
						// }
						// return ""; 
					});
			
			// Columns		
			cols[category_id] = row.selectAll("div.payer_cell")
					.data(payer_ids)
				.enter().append("div")
					.property("className", function(d) {return d;})
					.classed("cell", true)
					.classed("payer_cell", true)
					.classed("payer_cell_text", true)
					.classed(category_id, true)
					.style("border-width", CELL_BORDER_TB + "px " + CELL_BORDER_LR + "px " + CELL_BORDER_TB + "px " + CELL_BORDER_LR + "px")
					.style("left", function(d) {
						var l = colLeft(category_id, col_spending_tally) + ROW_LABEL_WIDTH;
						col_spending_tally += getPayerSpending(category_id, d);
						return l + "px";
					})
					.style("width", function(d) { return colWidth(category_id, d)  + "px";	});
		});
		
		initRollovers();		
	};
	
	
	this.update = function() {		
		var row_spending_tally = 0;
		var row_rollovers_spending_tally = 0;
		if (animate) {
			rows.transition()
				.duration(TRANSITION_DURATION)
				.style("top", function(d) {
					t = rowTop(row_spending_tally);
					row_spending_tally += getCategorySpending(d);
					var h = rowHeight(d);
					if (h < 4) return (t - 4) + "px";
					else return t + "px";
				})
				.style("height", function(d) {
					var h = rowHeight(d);
					if (h < 4) return "4px";
					else return h + "px";	
				});
			row_rollovers.transition()
				.duration(TRANSITION_DURATION)
				.style("top", function(d) {
					t = rowTop(row_rollovers_spending_tally);
					row_rollovers_spending_tally += getCategorySpending(d);
					var h = rowHeight(d);
					if (h < 4) return (t - 4) + "px";
					else return t + "px";
				})
				.style("height", function(d) {
					var h = rowHeight(d);
					if (h < 4) return "4px";
					else return h + "px";	
				});
		}
		else {			
			rows
				.style("top", function(d) {
					t = rowTop(row_spending_tally);
					row_spending_tally += getCategorySpending(d);
					var h = rowHeight(d);
					if (h < 4) return (t - 4) + "px";
					else return t + "px";
				})
				.style("height", function(d) {
					var h = rowHeight(d);
					if (h < 4) return "4px";
					else return h + "px";	
				});
			row_rollovers
				.style("top", function(d) {
					t = rowTop(row_rollovers_spending_tally);
					row_rollovers_spending_tally += getCategorySpending(d);
					var h = rowHeight(d);
					if (h < 4) return (t - 4) + "px";
					else return t + "px";
				})
				.style("height", function(d) {
					var h = rowHeight(d);
					if (h < 4) return "4px";
					else return h + "px";	
				});
		};
	
		_.each(category_ids, function(category_id) {
			var col_spending_tally = 0;
			var row_label = row_labels[category_id];
			var col = cols[category_id];
			
			// no transition for html
			row_label
				.html(function() {
					// if (row_label_height < rowHeight(category_id)) {
						var spendingAmountLabel = getCategorySpendingAmountLabel(category_id, true);
						return category_legend[category_id] + spendingAmountLabel;
					// }
					// return ""; 
				});
			
			if(animate) {
				col.transition()
					.duration(TRANSITION_DURATION)
					.style("left", function(d) {
						l = colLeft(category_id, col_spending_tally) + ROW_LABEL_WIDTH;
						col_spending_tally += getPayerSpending(category_id, d);
						return l + "px";
					})
					.style("width", function(d) { return colWidth(category_id, d)  + "px"; })
					.style("line-height", function() {return rowHeight(category_id) + "px";});
			} else {
				col
					.style("left", function(d) {
						l = colLeft(category_id, col_spending_tally) + ROW_LABEL_WIDTH;
						col_spending_tally += getPayerSpending(category_id, d);
						return l + "px";
					})
					.style("width", function(d) { return colWidth(category_id, d)  + "px"; });
			}
		});		
	};
	
	var getWidth = function() {return CHART_WIDTH - ROW_LABEL_WIDTH; };
	var getHeight = function() {return CHART_HEIGHT; };
	
	var inspect = function(obj) {
		console.log(obj);
	};
	
	var rowHeight = function(category) {
		var val = getCategorySpending(category);
		var height = val / getTotalSpending() * getHeight();
		return Math.round(height);
	};
	
	var colWidth = function(category, payer) {
		var val = getPayerSpending(category, payer);
		var width = val / getCategorySpending(category) * getWidth();
		return Math.round(width);
	};
	
	var rowTop = function(val) {
		var top = val / getTotalSpending() * getHeight();
		return Math.round(top);
	};
	
	var colLeft = function(category, val) {
		var left = val / getCategorySpending(category) * getWidth();
		return Math.round(left);
	};
	
	var getTextWidth = function(text, text_class) {
		dimension_test.toggleClass(text_class);
		dimension_test.html(text);
		var w = dimension_test.width();
		dimension_test.html("");
		dimension_test.toggleClass(text_class);
		return w;
	};
	
	var getTextHeight = function(text, text_class) {
		dimension_test.toggleClass(text_class);
		dimension_test.html(text);
		var h = dimension_test.height();
		dimension_test.html("");
		dimension_test.toggleClass(text_class);
		return h;
	};
	
	var getPayerSpendingAmountLabel = function(category, payer) {
		var val = getPayerSpending(category, payer);
		var percent = formatPercent(val / getCategorySpending(category));
		val = formatSpending(val);
		return "&nbsp;| $" + val + "B (" + percent + ")";		
	};
	
	var getCategorySpendingAmountLabel = function(category, show_percent) {
		var val = getCategorySpending(category);
		var percent = formatPercent(val / getTotalSpending());
		val = formatSpending(val);
		return show_percent ? 
				"&nbsp;| $" + val + "B (" + percent + ")" :
				"&nbsp;| $" + val + "B";	
	};
	
	var initRollovers = function() {
		$(".tree_row_rollover").mouseenter(function() {
			if (!year_playing) {
				var category = $(this).attr("category");
				var category_row = $("#" + category);
				var category_top = parseInt(category_row.css("top").replace("px", ""));
				var category_height = parseInt(category_row.css("height").replace("px", ""));
				
				var top = category_top + (category_height / 2) - (TT_HEIGHT / 2);
				top = Math.round(top);
				if ((top + TT_HEIGHT) > CHART_HEIGHT) top = CHART_HEIGHT - TT_HEIGHT + TT_BORDER_WIDTH;
				else if (top < 0) top = TT_BORDER_WIDTH;
				jq_tooltip.css("top", top + "px");
				
				var arrow_top = category_top + (category_height / 2) - (TT_ARROW_HEIGHT / 2);
				arrow_top = Math.round(arrow_top);
				jq_tooltip_arrow.css("top", arrow_top + "px");
				
				tt_category_title.html(category_legend[category]);
				
				$("#tt_spending_total").html(getCategorySpendingAmountLabel(category, false));			
				_.each(payer_ids, function(payer) {
					$("#tt_spending_" + payer).html(getPayerSpendingAmountLabel(category, payer));
				});
				
				jq_tooltip.css("display", "block");
				jq_tooltip_arrow.css("display", "block");
			}
		});
		
		$(".tree_row_rollover").mouseleave(function() {
			if (!year_playing) {
				jq_tooltip.css("display", "none");
				jq_tooltip_arrow.css("display", "none");
			}
		});	
	};
}
