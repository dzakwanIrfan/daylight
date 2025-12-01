import apiClient from '@/lib/axios';
import {
  // Country types
  QueryAdminCountryParams,
  QueryAdminCountryResponse,
  AdminCountry,
  CreateCountryPayload,
  UpdateCountryPayload,
  BulkActionCountryPayload,
  CountryOption,
  // City types
  QueryAdminCityParams,
  QueryAdminCityResponse,
  AdminCity,
  CreateCityPayload,
  UpdateCityPayload,
  BulkActionCityPayload,
  CityOption,
  // Common types
  BulkActionResponse,
} from '@/types/admin-location.types';

class LocationService {
  private readonly countryBaseURL = '/locations/countries';
  private readonly cityBaseURL = '/locations/cities';

  // COUNTRY METHODS

  async getCountryAll(params?: QueryAdminCountryParams): Promise<QueryAdminCountryResponse> {
    const response = await apiClient.get(this.countryBaseURL, { params });
    return response. data;
  }

  async getCountryById(id: string): Promise<AdminCountry> {
    const response = await apiClient.get(`${this.countryBaseURL}/${id}`);
    return response.data;
  }

  async createCountry(payload: CreateCountryPayload): Promise<{ message: string; data: AdminCountry }> {
    const response = await apiClient. post(this.countryBaseURL, payload);
    return response.data;
  }

  async updateCountry(id: string, payload: UpdateCountryPayload): Promise<{ message: string; data: AdminCountry }> {
    const response = await apiClient.put(`${this.countryBaseURL}/${id}`, payload);
    return response. data;
  }

  async deleteCountry(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.countryBaseURL}/${id}`);
    return response. data;
  }

  async bulkActionCountry(payload: BulkActionCountryPayload): Promise<BulkActionResponse> {
    const response = await apiClient. post(`${this.countryBaseURL}/bulk`, payload);
    return response.data;
  }

  async exportCountries(params?: QueryAdminCountryParams): Promise<AdminCountry[]> {
    const response = await apiClient.get(`${this.countryBaseURL}/export`, { params });
    return response.data;
  }

  async getCountryOptions(): Promise<CountryOption[]> {
    const response = await apiClient.get(`${this.countryBaseURL}/options`);
    return response.data;
  }

  // CITY METHODS

  async getCityAll(params?: QueryAdminCityParams): Promise<QueryAdminCityResponse> {
    const response = await apiClient.get(this. cityBaseURL, { params });
    return response.data;
  }

  async getCityById(id: string): Promise<AdminCity> {
    const response = await apiClient.get(`${this.cityBaseURL}/${id}`);
    return response.data;
  }

  async createCity(payload: CreateCityPayload): Promise<{ message: string; data: AdminCity }> {
    const response = await apiClient.post(this.cityBaseURL, payload);
    return response.data;
  }

  async updateCity(id: string, payload: UpdateCityPayload): Promise<{ message: string; data: AdminCity }> {
    const response = await apiClient.put(`${this.cityBaseURL}/${id}`, payload);
    return response.data;
  }

  async deleteCity(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.cityBaseURL}/${id}`);
    return response. data;
  }

  async bulkActionCity(payload: BulkActionCityPayload): Promise<BulkActionResponse> {
    const response = await apiClient.post(`${this.cityBaseURL}/bulk`, payload);
    return response. data;
  }

  async exportCities(params?: QueryAdminCityParams): Promise<AdminCity[]> {
    const response = await apiClient.get(`${this.cityBaseURL}/export`, { params });
    return response.data;
  }

  async getCityOptions(countryId?: string): Promise<CityOption[]> {
    const response = await apiClient.get(`${this.cityBaseURL}/options`, {
      params: countryId ? { countryId } : undefined,
    });
    return response.data;
  }
}

export const locationService = new LocationService();