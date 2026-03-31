function errorMiddleware(err, req, res, next) {
    console.error(err.stack || err.message);
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    res.status(status).json({ error: message });
  }
  
  export default errorMiddleware;