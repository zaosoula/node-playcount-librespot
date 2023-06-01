import { ZodSchema } from 'zod';
import { parse } from 'zod-error';

export const expectToMatchZodSchema = (model: ZodSchema, data: any) => {
  return parse(model, data, {
    transform: ({errorMessage}) => errorMessage.trim(),
    delimiter: {
      error: '\n',
      component: ' ',
    },
    path: {
      enabled: true,
      type: 'objectNotation',
      label: '',
      transform: ({value}) => value ? `- key:${value}` : '-'
    },
    code: {
      enabled: false
    },
    message: {
      enabled: true,
      label: '',
    }
  });
} 
