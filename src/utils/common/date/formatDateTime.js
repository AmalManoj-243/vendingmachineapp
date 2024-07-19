import { format } from 'date-fns';

const formatDateTime = (date = new Date(), formatString = 'dd MMMM yyyy HH:mm:ss') => {
    return date ? format(new Date(date), formatString) : '';
};

export default formatDateTime;
