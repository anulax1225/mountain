// Add to index.js or new logging.js module
const LOG_LEVELS = {
    ERROR: 0,    // Always shown
    WARN: 1,     // Production warnings
    INFO: 2,     // Debug mode
    TRACE: 3,    // Verbose debug
    PERF: 4      // Performance tracking
};

let currentLevel = LOG_LEVELS.WARN;

// Structured logger
const logger = {
    error: (module, phase, ...args) => log(LOG_LEVELS.ERROR, module, phase, ...args),
    warn: (module, phase, ...args) => log(LOG_LEVELS.WARN, module, phase, ...args),
    info: (module, phase, ...args) => log(LOG_LEVELS.INFO, module, phase, ...args),
    trace: (module, phase, ...args) => log(LOG_LEVELS.TRACE, module, phase, ...args),
    perf: (module, phase, duration, ...args) => log(LOG_LEVELS.PERF, module, phase, `[${duration}ms]`, ...args)
};

// Track operation flow across modules
const traceStack = [];

function beginTrace(operation, context) {
    const trace = {
        id: generateId(),
        operation,
        context,
        start: performance.now(),
        parent: traceStack[traceStack.length - 1]?.id,
        children: []
    };
    traceStack.push(trace);
    return trace.id;
}

function endTrace(traceId, result, error) {
    const trace = traceStack.pop();
    trace.duration = performance.now() - trace.start;
    trace.result = result;
    trace.error = error;

    if (trace.parent) {
        findTrace(trace.parent).children.push(trace);
    } else {
        // Root trace, log complete tree
        logTraceTree(trace);
    }
}

class CompositorError extends Error {
    constructor(message, context) {
        super(message);
        this.name = this.constructor.name;
        this.context = context;
        this.timestamp = Date.now();
        this.traceId = getCurrentTraceId();
    }

    // Chain errors while preserving context
    wrap(parentError) {
        this.cause = parentError;
        this.context = { ...parentError.context, ...this.context };
        return this;
    }
}

// Specific error types
class NamespaceError extends CompositorError { }
class RegistryError extends CompositorError { }
class ComponentError extends CompositorError { }
class SlotError extends CompositorError { }
class StrategyError extends CompositorError { }