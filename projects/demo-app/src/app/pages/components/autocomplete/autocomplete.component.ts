import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgInboModule } from 'ng-inbo';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

interface Country {
  name: string;
  code: string;
}

interface Product {
  code: string;
  name: string;
}

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgInboModule,
  ],
  templateUrl: 'autocomplete.component.html',
  styleUrls: ['autocomplete.component.scss'],
})
export class AutocompleteComponent {
  selectedCountry: Country | null = null;
  selectedProduct: Product | null = null;

  // Sample data for demonstration
  private countries: Array<Country> = [
    { name: 'Belgium', code: 'BE' },
    { name: 'Netherlands', code: 'NL' },
    { name: 'France', code: 'FR' },
    { name: 'Germany', code: 'DE' },
    { name: 'Spain', code: 'ES' },
    { name: 'Italy', code: 'IT' },
    { name: 'United Kingdom', code: 'UK' },
    { name: 'Portugal', code: 'PT' },
  ];

  // Sample product data with codes that follow the cc-cc-cc pattern
  private products: Array<Product> = [
    { code: 'AB-12-C4', name: 'Premium Widget' },
    { code: 'XY-78-Z9', name: 'Standard Gadget' },
    { code: 'PQ-45-R7', name: 'Deluxe Accessory' },
    { code: 'MN-34-K5', name: 'Economy Tool' },
    { code: 'CD-67-H8', name: 'Professional Kit' },
    { code: 'LM-23-F6', name: 'Starter Pack' },
  ];

  searchCountries = (query: string) => {
    const filteredCountries = this.countries.filter(country =>
      country.name.toLowerCase().includes(query.toLowerCase())
    );

    return of(filteredCountries).pipe(delay(300));
  };

  searchProducts = (query: string) => {
    // Remove any non-alphanumeric characters for comparison
    const cleanQuery = query.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    const filteredProducts = this.products.filter(product => {
      // Remove separators from the product code for comparison
      const cleanCode = product.code.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      return (
        cleanCode.includes(cleanQuery) ||
        product.name.toLowerCase().includes(query.toLowerCase())
      );
    });

    return of(filteredProducts).pipe(delay(300));
  };

  onCountrySelected(country: Country) {
    this.selectedCountry = country;
    console.log('Selected country:', country);
  }

  onProductSelected(product: Product) {
    this.selectedProduct = product;
    console.log('Selected product:', product);
  }
}
