function TreemapVisualization() {
	var tt_service_title = $("#tt_service_title");
	var chart = d3.select("#chart");
	var rows;
	var row_labels = new Object();
	var cols = new Object();
	
	var dimension_test = $("#dimension_test");
	var row_label_height;
	var payer_label_height;
	var payer_label_widths = new Object();

	this.render = function() {		
		// Measure text dimensions
		row_label_height = getTextHeight("Test", "row_label_text");
		payer_label_height = getTextHeight("Test", "payer_cell_text");
		_.each(payers_elements, function(payer_id) {
			payer_label_widths[payer_id] = getTextWidth(payers_legend[payer_id]["title"], "payer_cell_text");
		});
		
		jq_year_label.css("width", CHART_WIDTH - ROW_LABEL_WIDTH + "px");
		jq_year_label.css("height", CHART_HEIGHT + "px");
		jq_year_label.css("left", ROW_LABEL_WIDTH + CELL_BORDER_LR + "px");
		jq_year_label.css("top", CELL_BORDER_TB + "px");
		jq_year_label.css("line-height", CHART_HEIGHT + "px");
		
		// Init rows
		var row_spending_tally = 0;
		rows = chart.selectAll("div.tree_row")
				.data(services_elements)
			.enter().append("div")
				.attr("id", function(d) {return d;})
				.classed("tree_row", true)
				.style("top", function(d) {
					t = rowTop(row_spending_tally);
					row_spending_tally += getSpending(d, TOTAL_PAYERS);
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
				.data(services_elements)
			.enter().append("div")
				.attr("id", function(d) {return d + "_rollover";})
				.classed("tree_row_rollover", true)
				.style("width", CHART_WIDTH - ROW_LABEL_WIDTH + "px")
				.style("left", ROW_LABEL_WIDTH + "px")
				.style("border-width", "0px " + CELL_BORDER_LR + "px " + CELL_BORDER_TB + "px " + CELL_BORDER_LR + "px")
				.attr("service", function(d) {return d;})
				.style("top", function(d) {
					t = rowTop(row_rollovers_spending_tally);
					row_rollovers_spending_tally += getSpending(d, TOTAL_PAYERS);
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
		_.each(services_elements, function(service_id) {			
			var row = d3.select("#" + service_id);
			var col_spending_tally = 0;

			// Row Labels
			row_labels[service_id] = row.append("div")
					.classed("row_label", true)
					.style("width", ROW_LABEL_WIDTH - ROW_LABEL_PADDING_RT + "px")
					.style("padding-right", ROW_LABEL_PADDING_RT + "px")
					.html(function() {
						// if (row_label_height < rowHeight(service_id)) {
							var spendingAmountLabel = getServiceSpendingAmountLabel(service_id, true);
							return services_legend[service_id]["title"] + spendingAmountLabel;
						// }
						// return ""; 
					});
			
			// Columns		
			cols[service_id] = row.selectAll("div.payer_cell")
					.data(payers_elements)
				.enter().append("div")
					.property("className", function(d) {return d;})
					.classed("cell", true)
					.classed("payer_cell", true)
					.classed("payer_cell_text", true)
					.classed(service_id, true)
					.style("border-width", CELL_BORDER_TB + "px " + CELL_BORDER_LR + "px " + CELL_BORDER_TB + "px " + CELL_BORDER_LR + "px")
					.style("left", function(d) {
						var l = colLeft(service_id, col_spending_tally) + ROW_LABEL_WIDTH;
						col_spending_tally += getSpending(service_id, d);
						return l + "px";
					})
					.style("width", function(d) { return colWidth(service_id, d)  + "px";	});
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
					row_spending_tally += getSpending(d, TOTAL_PAYERS);
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
					row_rollovers_spending_tally += getSpending(d, TOTAL_PAYERS);
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
					row_spending_tally += getSpending(d, TOTAL_PAYERS);
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
					row_rollovers_spending_tally += getSpending(d, TOTAL_PAYERS);
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
	
		_.each(services_elements, function(service_id) {
			var col_spending_tally = 0;
			var row_label = row_labels[service_id];
			var col = cols[service_id];
			
			// no transition for html
			row_label
				.html(function() {
					// if (row_label_height < rowHeight(service_id)) {
						var spendingAmountLabel = getServiceSpendingAmountLabel(service_id, true);
						return services_legend[service_id]["title"] + spendingAmountLabel;
					// }
					// return ""; 
				});
			
			if(animate) {
				col.transition()
					.duration(TRANSITION_DURATION)
					.style("left", function(d) {
						l = colLeft(service_id, col_spending_tally) + ROW_LABEL_WIDTH;
						col_spending_tally += getSpending(service_id, d);
						return l + "px";
					})
					.style("width", function(d) { return colWidth(service_id, d)  + "px"; })
					.style("line-height", function() {return rowHeight(service_id) + "px";});
			} else {
				col
					.style("left", function(d) {
						l = colLeft(service_id, col_spending_tally) + ROW_LABEL_WIDTH;
						col_spending_tally += getSpending(service_id, d);
						return l + "px";
					})
					.style("width", function(d) { return colWidth(service_id, d)  + "px"; });
			}
		});		
	};
	
	var getWidth = function() {return CHART_WIDTH - ROW_LABEL_WIDTH; };
	var getHeight = function() {return CHART_HEIGHT };
	
	var inspect = function(obj) {
		console.log(obj);
	};
	
	var rowHeight = function(service) {
		var val = getSpending(service, TOTAL_PAYERS);
		var height = val / getSpending(TOTAL_SERVICES, TOTAL_PAYERS) * getHeight();
		return Math.round(height);
	};
	
	var colWidth = function(service, payer) {
		var val = getSpending(service, payer);
		var width = val / getSpending(service, TOTAL_PAYERS) * getWidth();
		return Math.round(width);
	};
	
	var rowTop = function(val) {
		var top = val / getSpending(TOTAL_SERVICES, TOTAL_PAYERS) * getHeight();
		return Math.round(top);
	};
	
	var colLeft = function(service, val) {
		var left = val / getSpending(service, TOTAL_PAYERS) * getWidth();
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
	
	var getPayerSpendingAmountLabel = function(s, p) {
		var val = getSpending(s, p);
		var percent = formatPercent(val / getSpending(s, TOTAL_PAYERS));
		val = formatSpending(val);
		return "&nbsp;| $" + val + "B (" + percent + ")";		
	};
	
	var getServiceSpendingAmountLabel = function(s, show_percent) {
		var val = getSpending(s, TOTAL_PAYERS);
		var percent = formatPercent(val / getSpending(TOTAL_SERVICES, TOTAL_PAYERS));
		val = formatSpending(val);
		return show_percent ? 
				"&nbsp;| $" + val + "B (" + percent + ")" :
				"&nbsp;| $" + val + "B";	
	};
	
	var initRollovers = function() {
		$(".tree_row_rollover").mouseenter(function() {
			if (!year_playing) {
				var service = $(this).attr("service");
				var service_row = $("#" + service);
				var service_top = parseInt(service_row.css("top").replace("px", ""));
				var service_height = parseInt(service_row.css("height").replace("px", ""));
				
				var top = service_top + (service_height / 2) - (TT_HEIGHT / 2)
				top = Math.round(top);
				if ((top + TT_HEIGHT) > CHART_HEIGHT) top = CHART_HEIGHT - TT_HEIGHT + TT_BORDER_WIDTH;
				else if (top < 0) top = TT_BORDER_WIDTH;
				jq_tooltip.css("top", top + "px");
				
				var arrow_top = service_top + (service_height / 2) - (TT_ARROW_HEIGHT / 2);
				arrow_top = Math.round(arrow_top);
				jq_tooltip_arrow.css("top", arrow_top + "px");
				
				tt_service_title.html(services_legend[service].title);
				
				$("#tt_spending_total").html(getServiceSpendingAmountLabel(service, false));			
				_.each(payers_elements, function(payer) {
					$("#tt_spending_" + payer).html(getPayerSpendingAmountLabel(service, payer));
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
