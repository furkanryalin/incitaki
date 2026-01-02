import winston from 'winston';

/**
 * Logging sistemi
 * Production'da dosyaya, development'ta console'a yazar
 */

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Transport'ları oluştur
const transports: winston.transport[] = [];

// Production'da dosyaya yaz
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
} else {
  // Development'ta console'a yaz
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Logger instance'ı oluştur
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports,
  // Exception ve rejection'ları yakala
  exceptionHandlers: transports,
  rejectionHandlers: transports,
});

// Helper fonksiyonlar
export const log = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  verbose: (message: string, meta?: any) => logger.verbose(message, meta),
};

// API route'lar için özel logger
export const apiLogger = {
  request: (method: string, path: string, status: number, duration?: number) => {
    logger.info('API Request', {
      method,
      path,
      status,
      duration: duration ? `${duration}ms` : undefined,
    });
  },
  error: (method: string, path: string, error: Error | string, status?: number) => {
    logger.error('API Error', {
      method,
      path,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      status,
    });
  },
};

