from ..base_service import BaseReviewService

class RatingConverter(BaseReviewService):
    @staticmethod
    def score_to_rating(score, rating_scale, use_percentage=True):
        if score is None or not rating_scale:
            return None
        if use_percentage:
            return rating_scale.get_level_by_percentage(float(score))
        return rating_scale.get_level_by_value(float(score))
    @staticmethod
    def score_to_label(score, rating_scale, use_percentage=True):
        if score is None or not rating_scale:
            return "Not Rated"
        level = RatingConverter.score_to_rating(score, rating_scale, use_percentage)
        return level.get('label', 'Not Rated') if level else 'Not Rated'
    @staticmethod
    def score_to_color(score, rating_scale, use_percentage=True):
        if score is None or not rating_scale:
            return '#95a5a6'
        level = RatingConverter.score_to_rating(score, rating_scale, use_percentage)
        return level.get('color', '#95a5a6') if level else '#95a5a6'
    @staticmethod
    def batch_convert(scores, rating_scale, use_percentage=True):
        if not rating_scale:
            return []
        results = []
        for score in scores:
            results.append({'score': score, 'rating': RatingConverter.score_to_rating(score, rating_scale, use_percentage), 'label': RatingConverter.score_to_label(score, rating_scale, use_percentage), 'color': RatingConverter.score_to_color(score, rating_scale, use_percentage)})
        return results
    @staticmethod
    def get_rating_distribution(ratings, rating_scale):
        if not rating_scale or not ratings:
            return {}
        distribution = {}
        total = len(ratings)
        for level in rating_scale.levels:
            label = level.get('label')
            min_pct = level.get('min_pct', 0)
            max_pct = level.get('max', 100)
            count = 0
            for rating in ratings:
                score = getattr(rating, 'final_score', None)
                if score and min_pct <= float(score) <= max_pct:
                    count += 1
            distribution[label] = {'count': count, 'percentage': round((count / total) * 100, 1) if total > 0 else 0, 'color': level.get('color', '#95a5a6'), 'min_score': min_pct, 'max_score': max_pct}
        return distribution
    @staticmethod
    def get_rating_summary(score, rating_scale, additional_data=None):
        result = {'score': float(score) if score is not None else None, 'label': RatingConverter.score_to_label(score, rating_scale), 'color': RatingConverter.score_to_color(score, rating_scale)}
        if additional_data:
            result.update(additional_data)
        return result