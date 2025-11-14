import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SelectOffersUseCase } from '../../../offers/application/use-cases/select-offers.contract';
import type { Logger } from '../../../../application/ports/logger.port';
import { PersonalOffersPresenter } from '../../interface-adapters/presenters/personal-offers.presenter';

const selectOffersUseCaseMock: SelectOffersUseCase = {
  execute: vi.fn(),
};

const loggerMock: Logger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

const createPresenter = (): PersonalOffersPresenter =>
  new PersonalOffersPresenter(selectOffersUseCaseMock, loggerMock);

describe('PersonalOffersPresenter', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads offers and exposes them via the view model', async () => {
    const presenter = createPresenter();
    const onChange = vi.fn();
    presenter.setOnViewModelChanged(onChange);

    vi.mocked(selectOffersUseCaseMock.execute).mockResolvedValueOnce({
      offers: [
        {
          id: 'offer-1',
          title: 'Welcome Pack',
        },
      ],
    });

    await presenter.showOffers({ appId: 'APP123', userId: 'user-1' });

    const viewModel = presenter.getViewModel();
    expect(viewModel.status).toBe('success');
    expect(viewModel.isVisible).toBe(true);
    expect(viewModel.offers).toHaveLength(1);
    expect(onChange).toHaveBeenCalled();
  });

  it('hides popup when there are no offers returned', async () => {
    const presenter = createPresenter();

    vi.mocked(selectOffersUseCaseMock.execute).mockResolvedValueOnce({ offers: [] });

    await presenter.showOffers({ appId: 'APP123', userId: 'user-1' });

    const viewModel = presenter.getViewModel();
    expect(viewModel.status).toBe('success');
    expect(viewModel.isVisible).toBe(false);
    expect(viewModel.offers).toHaveLength(0);
  });

  it('handles errors gracefully', async () => {
    const presenter = createPresenter();

    vi.mocked(selectOffersUseCaseMock.execute).mockRejectedValueOnce(new Error('boom'));

    await presenter.showOffers({ appId: 'APP123', userId: 'user-1' });

    const viewModel = presenter.getViewModel();
    expect(viewModel.status).toBe('error');
    expect(viewModel.isVisible).toBe(false);
    expect(viewModel.errorMessage).toBe(presenter.labels.error);
  });

  it('ignores calls when context is missing', async () => {
    const presenter = createPresenter();

    await presenter.showOffers({ appId: '', userId: '' });

    expect(selectOffersUseCaseMock.execute).not.toHaveBeenCalled();
    const viewModel = presenter.getViewModel();
    expect(viewModel.isVisible).toBe(false);
    expect(viewModel.status).toBe('error');
  });

  it('can hide popup explicitly', async () => {
    const presenter = createPresenter();

    vi.mocked(selectOffersUseCaseMock.execute).mockResolvedValueOnce({
      offers: [
        {
          id: 'offer-1',
          title: 'Welcome Pack',
        },
      ],
    });

    await presenter.showOffers({ appId: 'APP123', userId: 'user-1' });
    presenter.hideOffers();

    const viewModel = presenter.getViewModel();
    expect(viewModel.isVisible).toBe(false);
  });
});


