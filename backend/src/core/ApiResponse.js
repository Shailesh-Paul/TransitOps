/**
 * Standardized API Response structure for successful requests.
 */
class ApiResponse {
  /**
   * Send a standard JSON success response
   * @param {Object} res - Express response object
   * @param {Object} data - Payload to send
   * @param {string} [message] - Optional success message
   * @param {number} [statusCode=200] - HTTP status code
   */
  static send(res, data, message = undefined, statusCode = 200) {
    res.status(statusCode).json({
      success: true,
      ...(message && { message }),
      ...(data !== undefined && data !== null && { data }),
      requestId: res.req ? res.req.id : undefined,
    });
  }

  /**
   * Send a paginated JSON success response
   * @param {Object} res - Express response object
   * @param {Object} paginatedResult - Result from BaseRepository.findAll
   * @param {string} [message] - Optional success message
   */
  static sendPaginated(res, paginatedResult, message = undefined) {
    res.status(200).json({
      success: true,
      ...(message && { message }),
      data: paginatedResult.data,
      meta: paginatedResult.meta,
      requestId: res.req ? res.req.id : undefined,
    });
  }
}

export default ApiResponse;
