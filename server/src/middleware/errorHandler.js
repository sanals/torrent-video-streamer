/**
 * Global error handling middleware
 */
export default function errorHandler(err, req, res, next) {
    console.error('❌ Error:', err);

    // Default error status and message
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal server error';

    // Send error response
    res.status(status).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}
