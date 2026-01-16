import { injectable, inject } from 'inversify';
import type { EventBus } from '../ports/event-bus.port';
import type { Logger } from '../ports/logger.port';
import { TYPES } from '../../infrastructure/bootstrap/types';
import { AppConfigLoadedEvent } from '../../shared/events/app-config-events';
import type { AppConfig } from '../../shared/config/app-config.types';
import type { SupabaseConfigLoader } from '../../infrastructure/config/supabase-config-loader';

@injectable()
export class LoadAppConfigUseCase {
	constructor(
    // HTTP fallback удалён: конфиг загружаем только из Supabase
		@inject(TYPES.EventBus)
		private readonly _eventBus: EventBus,
		@inject(TYPES.Logger)
		private readonly _logger: Logger,
		@inject(TYPES.SupabaseConfigLoader)
		private readonly _supabaseLoader: SupabaseConfigLoader
	) {}

	public async execute(isDraft?: boolean, appId?: string): Promise<void> {
		const shouldLoadDraft = typeof isDraft === 'boolean'
			? isDraft
			: this._shouldLoadDraftFromEnvironment();

		// Check if we're in UI Builder iframe mode
		const isUIBuilderMode = this._isUIBuilderMode();
		if (isUIBuilderMode) {
			// In UI Builder mode, still load active config as fallback
			// The CONFIG_UPDATE message from parent will override it when it arrives
			this._logger.info('[LoadAppConfigUseCase] UI Builder iframe mode detected - loading active config as fallback (will be overridden by CONFIG_UPDATE)');
			// Continue to load config below, but force isDraft=false to load active config
		}

		this._logger.info('[LoadAppConfigUseCase] Loading app configuration', {
			isDraft: shouldLoadDraft,
			source: typeof isDraft === 'boolean' ? 'argument' : 'query',
		});

		try {
      const resolvedAppId = appId || this._getAppIdFromEnvironment();
      if (!resolvedAppId) {
        throw new Error('[LoadAppConfigUseCase] appId is required but was not provided');
      }

			// Use shouldLoadDraft to determine which config to load
			let config: AppConfig | null = null;

			if (shouldLoadDraft) {
				config = await this._supabaseLoader.loadDraftConfig(resolvedAppId);
				if (!config) {
					this._logger.warn('[LoadAppConfigUseCase] Draft config not found, trying active as fallback', { appId: resolvedAppId });
					config = await this._supabaseLoader.loadConfig(resolvedAppId);
				}
			} else {
				config = await this._supabaseLoader.loadConfig(resolvedAppId);

				// If active config not found, try to load draft as fallback (for UI Builder preview mode)
				if (!config) {
					this._logger.warn('[LoadAppConfigUseCase] Active config not found, trying draft as fallback', { appId: resolvedAppId });
					config = await this._supabaseLoader.loadDraftConfig(resolvedAppId);
				}
			}

      // If no config found, create empty config to ensure modules can still initialize
      if (!config) {
				const configType = shouldLoadDraft ? 'draft' : 'active';
        this._logger.warn(`[LoadAppConfigUseCase] ${configType} config not found for appId: ${resolvedAppId}, using empty config`);
        config = {
          version: "1.0",
          environment: 'development',
          theme: {
            colors: {
              primary: "#3B5AFE",
              secondary: "#7C4DFF",
              accent: "#FF4081",
              background: "#0D1117",
              surface: "#161B22",
              text: "#FFFFFF",
              textSecondary: "#A0A0A0",
              success: "#4CAF50",
              error: "#F44336",
              warning: "#FF9800",
              border: "#2D3748"
            },
            spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80],
            borderRadius: {
              small: 4,
              medium: 8,
              large: 12,
              full: 9999
            },
            typography: {
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: {
                xs: "0.75rem",
                sm: "0.875rem",
                base: "1rem",
                lg: "1.125rem",
                xl: "1.25rem",
                "2xl": "1.5rem",
                "3xl": "1.875rem",
                "4xl": "2.25rem"
              },
              fontWeight: {
                normal: 400,
                medium: 500,
                semibold: 600,
                bold: 700,
                extrabold: 800
              }
            },
            background: {}
          },
          shared: {},
          modules: {
            authentication: {
              loginButtonUI: {},
              labels: {
                loginButton: "Login",
                logoutButton: "Logout",
                appIdPlaceholder: "Enter App ID",
                submitButton: "Submit",
                welcomeTitle: "Welcome",
                welcomeMessage: "Please enter your credentials",
                welcomeSubtitle: "Secure login required",
                enterAppId: "Enter Application ID",
                successMessage: "Login successful",
                errorMessage: "Login failed",
                loadingMessage: "Logging in...",
                helpQuestion: "Need help?",
                helpAnswer: "Contact support for assistance",
                agreementText: "I agree to the terms and conditions",
                userIdPlaceholder: "Enter User ID",
                enterUserId: "Enter User ID",
                backButton: "Back",
                nextButton: "Next",
                cancelButton: "Cancel",
                saveButton: "Save",
                deleteButton: "Delete",
                editButton: "Edit",
                createButton: "Create",
                searchButton: "Search",
                refreshButton: "Refresh",
                closeButton: "Close",
                openButton: "Open",
                confirmButton: "Confirm",
                rejectButton: "Reject",
                approveButton: "Approve",
                denyButton: "Deny",
                acceptButton: "Accept",
                declineButton: "Decline",
                yesButton: "Yes",
                noButton: "No",
                okButton: "OK",
                retryButton: "Retry",
                skipButton: "Skip",
                continueButton: "Continue",
                finishButton: "Finish",
                startButton: "Start",
                stopButton: "Stop",
                pauseButton: "Pause",
                resumeButton: "Resume",
                resetButton: "Reset",
                clearButton: "Clear",
                applyButton: "Apply",
                removeButton: "Remove",
                addButton: "Add",
                updateButton: "Update",
                uploadButton: "Upload",
                downloadButton: "Download",
                importButton: "Import",
                exportButton: "Export",
                shareButton: "Share",
                copyButton: "Copy",
                pasteButton: "Paste",
                cutButton: "Cut",
                undoButton: "Undo",
                redoButton: "Redo",
                selectAllButton: "Select All",
                deselectAllButton: "Deselect All",
                selectButton: "Select",
                unselectButton: "Unselect",
                expandButton: "Expand",
                collapseButton: "Collapse",
                showButton: "Show",
                hideButton: "Hide",
                toggleButton: "Toggle",
                enableButton: "Enable",
                disableButton: "Disable",
                activateButton: "Activate",
                deactivateButton: "Deactivate",
                lockButton: "Lock",
                unlockButton: "Unlock",
                settingsButton: "Settings",
                profileButton: "Profile",
                helpButton: "Help",
                infoButton: "Info",
                warningMessage: "Warning",
                errorTitle: "Error",
                successTitle: "Success",
                infoTitle: "Information",
                confirmationTitle: "Confirmation",
                validationError: "Validation Error",
                requiredField: "This field is required",
                invalidEmail: "Invalid email address",
                invalidPassword: "Invalid password",
                passwordMismatch: "Passwords do not match",
                tooShort: "Too short",
                tooLong: "Too long",
                invalidFormat: "Invalid format",
                duplicateValue: "Duplicate value",
                notFound: "Not found",
                alreadyExists: "Already exists",
                permissionDenied: "Permission denied",
                sessionExpired: "Session expired",
                networkError: "Network error",
                serverError: "Server error",
                unknownError: "Unknown error",
                retryLater: "Please try again later",
                contactSupport: "Please contact support",
                termsOfService: "Terms of Service",
                privacyPolicy: "Privacy Policy",
                cookiePolicy: "Cookie Policy",
                refundPolicy: "Refund Policy"
              }
            },
            uiRenderer: {
              store: { version: "1.0", theme: { colors: {}, spacing: [] }, layout: { id: "default-store", type: "Container", props: {}, styles: {}, children: [] } },
              sidebar: { version: "1.0", theme: { colors: {}, spacing: [] }, layout: { id: "default-sidebar", type: "Container", props: {}, styles: {}, children: [] } },
              rightSidebar: { version: "1.0", theme: { colors: {}, spacing: [] }, layout: { id: "default-right-sidebar", type: "Container", props: {}, styles: {}, children: [] } },
            }
          }
        };
      }

      this._logger.info('[LoadAppConfigUseCase] App config loaded successfully (Supabase)', {
        version: config.version,
        environment: config.environment,
				isDraft: shouldLoadDraft,
				hasModules: !!config.modules,
				hasUIRenderer: !!config.modules?.uiRenderer,
				hasSidebar: !!config.modules?.uiRenderer?.sidebar,
				sidebarChildrenCount: config.modules?.uiRenderer?.sidebar?.layout?.children?.length || 0
      });

			// Publish event for all modules to consume
      await this._eventBus.publishAsync(new AppConfigLoadedEvent(config as AppConfig));

			this._logger.info('[LoadAppConfigUseCase] AppConfigLoadedEvent published');
		} catch (error) {
			this._logger.error('[LoadAppConfigUseCase] Failed to load app config', error);
			throw error;
		}
	}

  private _getAppIdFromEnvironment(): string | null {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        // Support both 'appId' and 'app' query parameters
        const fromQuery = url.searchParams.get('appId') || url.searchParams.get('app');
        if (fromQuery) return fromQuery;
      } catch {}
    }
    return process.env.NEXT_PUBLIC_APP_ID || null;
  }

	private _shouldLoadDraftFromEnvironment(): boolean {
		if (typeof window === 'undefined') {
			return false;
		}

		try {
			const url = new URL(window.location.href);
			const draftParams = ['previewMode', 'pagePreview', 'uibuilder'];
			return draftParams.some((param) => url.searchParams.get(param) === 'true');
		} catch {
			return false;
		}
	}

	private _isUIBuilderMode(): boolean {
		if (typeof window === 'undefined') {
			return false;
		}

		try {
			const url = new URL(window.location.href);
			return url.searchParams.get('uibuilder') === 'true';
		} catch {
			return false;
		}
	}
}

