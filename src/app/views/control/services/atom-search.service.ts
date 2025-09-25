import { Injectable } from '@angular/core';
import { SearchQuery } from '../models/atom-models';

@Injectable({
  providedIn: 'root'
})
export class AtomSearchService {

  constructor() { }

  /**
   * Updates the search key from search text
   */
  updateSearchKey(searchText: string): string {
    return searchText.split('=')[0];
  }

  /**
   * Chooses the appropriate retrieval interaction based on search key
   */
  chooseRetrievalInteraction(searchKey: string): string {
    let output = '';
    if (searchKey === 'labels') {
      output = 'retrieve_atoms_features';
    } else if (searchKey === 'uuid') {
      output = 'retrieve_atom_features_nested';
    }
    return output;
  }

  /**
   * Parses search text into a query object
   */
  parseSearchTextIntoQuery(searchText: string, readout: string): SearchQuery {
    const query: SearchQuery = {
      readout: readout,
      args: {
        selector: {
          bonds: [],
          labels: [],
          properties: {
            shellies: {
              uuid: ''
            },
            nuclearies: {
              title: '',
              description: '',
              content: 0.0,
              constants: [],
              operation: ''
            }
          }
        }
      }
    };

    const pairs = searchText.split(' ');

    pairs.forEach(pair => {
      const [key, value] = pair.split('=');

      if (key === 'labels') {
        query.args.selector.labels = value ? value.split(',') : [];
      }

      if (key === 'uuid') {
        query.args.selector.properties.shellies.uuid = value;
      }
    });

    return query;
  }

  /**
   * Validates search text format
   */
  validateSearchText(searchText: string): boolean {
    if (!searchText || searchText.trim() === '') {
      return false;
    }

    const pairs = searchText.split(' ');
    return pairs.every(pair => {
      const [key, value] = pair.split('=');
      return key && value && (key === 'labels' || key === 'uuid');
    });
  }
}
