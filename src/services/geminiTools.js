"use strict";
/**
 * Gemini Tools for MDM Sales Architect
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.log_interaction_data = exports.request_sales_callback = exports.generate_interior_render = exports.calculate_base_cost_estimate = void 0;
/**
 * Calculates the base cost estimate for a house.
 * @param house_model The model of the house.
 * @param package_option The finishing package option.
 * @param distance_category The distance category for transport.
 */
var calculate_base_cost_estimate = function (house_model, package_option, distance_category) {
    console.log("[Tool] calculate_base_cost_estimate called", { house_model: house_model, package_option: package_option, distance_category: distance_category });
    // Mock calculation logic
    var basePrice = 100000;
    return basePrice + (house_model.length * 1000) + (package_option.length * 500);
};
exports.calculate_base_cost_estimate = calculate_base_cost_estimate;
/**
 * Generates an interior render visualization.
 * @param view_type The type of view (e.g., living room, kitchen).
 * @param style_name The style of the interior (e.g., modern, scandinavian).
 */
var generate_interior_render = function (view_type, style_name) {
    console.log("[Tool] generate_interior_render called", { view_type: view_type, style_name: style_name });
    // Return a placeholder image URL
    return "https://placehold.co/600x400?text=".concat(encodeURIComponent(view_type + ' - ' + style_name));
};
exports.generate_interior_render = generate_interior_render;
/**
 * Requests a sales callback for escalation.
 * @param escalation_reason The reason for escalation.
 * @param client_query_summary A summary of the client's query.
 * @param client_phone_number Optional phone number if provided by the client.
 */
var request_sales_callback = function (escalation_reason, client_query_summary, client_phone_number) {
    console.log("[Tool] request_sales_callback called", { escalation_reason: escalation_reason, client_query_summary: client_query_summary, client_phone_number: client_phone_number });
    // Mock CRM integration
};
exports.request_sales_callback = request_sales_callback;
/**
 * Logs interaction data for statistics (Silent Logging).
 * @param event_type The type of event to log.
 * @param details A concise description of the context.
 */
var log_interaction_data = function (event_type, details) {
    // Synchronous logging as requested
    console.log("[Silent Log] ".concat(event_type, ": ").concat(details));
};
exports.log_interaction_data = log_interaction_data;
