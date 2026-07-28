import {
	BLOB_HTTP_OPTIONS as EUI_BLOB_HTTP_OPTIONS,
	JSON_HTTP_OPTIONS as EUI_JSON_HTTP_OPTIONS,
	JSON_OPTIONS_WITH_GLOBAL_LOADER as EUI_JSON_OPTIONS_WITH_GLOBAL_LOADER,
	SKIP_ERROR_OPTIONS as EUI_SKIP_ERROR_OPTIONS,
	STRING_HTTP_OPTIONS as EUI_STRING_HTTP_OPTIONS,
	withAcceptLanguage,
} from '@ferhaps/easy-ui-lib';

/**
 * Locale sent as `Accept-Language` on every request. The library ships no
 * locale of its own, so the app opts in here rather than per call site.
 */
const LOCALE = 'bg';

/** JSON request/response. */
export const JSON_HTTP_OPTIONS = withAcceptLanguage(
	EUI_JSON_HTTP_OPTIONS,
	LOCALE,
);

/** Plain-text response. */
export const STRING_HTTP_OPTIONS = withAcceptLanguage(
	EUI_STRING_HTTP_OPTIONS,
	LOCALE,
);

/** Binary (blob) response. */
export const BLOB_HTTP_OPTIONS = withAcceptLanguage(
	EUI_BLOB_HTTP_OPTIONS,
	LOCALE,
);

/**
 * JSON request that suppresses the global error popup. Use it when the caller
 * renders its own inline error — the interceptor still rethrows.
 */
export const SKIP_ERROR_OPTIONS = withAcceptLanguage(
	EUI_SKIP_ERROR_OPTIONS,
	LOCALE,
);

/** JSON request that drives the global loader for its lifetime. */
export const JSON_OPTIONS_WITH_GLOBAL_LOADER = withAcceptLanguage(
	EUI_JSON_OPTIONS_WITH_GLOBAL_LOADER,
	LOCALE,
);

export const TOKEN_KEY = 'INVENTORY_TOKEN';
