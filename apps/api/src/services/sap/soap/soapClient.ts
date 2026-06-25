import axios from 'axios';
import { SAPAuth } from '../shared/sapAuth';

export class SOAPClient {
  private sapClient;

  constructor() {
    this.sapClient = SAPAuth.getInstance().getClient();
  }

  async sendSOAPRequest(url: string, soapBody: string, action?: string): Promise<any> {
    try {
      const headers: any = {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': action || '',
        'Accept': 'application/xml'
      };

      const response = await this.sapClient.post(url, soapBody, { headers });
      
      // Parse XML response
      const { parseString } = await import('xml2js');
      const parsed = await new Promise((resolve, reject) => {
        parseString(response.data, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      return parsed;
    } catch (error) {
      console.error('SOAP request failed:', error);
      throw error;
    }
  }

  buildSOAPEnvelope(body: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema">
        <soap:Header/>
        <soap:Body>
          ${body}
        </soap:Body>
      </soap:Envelope>`;
  }
}
